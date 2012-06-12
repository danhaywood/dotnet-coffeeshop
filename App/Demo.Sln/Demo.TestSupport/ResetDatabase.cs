using System;
using System.Collections.Generic;
using System.Data;
using System.Data.EntityClient;
using System.IO;
using System.Linq;
using System.Data.SqlClient;
using Demo.Util;
using Excel;

namespace Demo.TestSupport
{
	public class ResetDatabase
	{
		private readonly SqlConnectionAdapter _conn;

		public static ResetDatabase CreateFromEFConnectionString(string efConnStr)
		{
			var builder = new EntityConnectionStringBuilder(efConnStr);
			var connStr = builder.ProviderConnectionString;
			var conn = new SqlConnectionAdapterUsingSqlConnection(new SqlConnection(connStr));
			return new ResetDatabase(conn);
		}

		public static ResetDatabase CreateFromConnectionString(string connStr)
		{
			var conn = new SqlConnectionAdapterUsingSqlConnection(new SqlConnection(connStr));
			return new ResetDatabase(conn);
		}

		public ResetDatabase(SqlConnectionAdapter conn)
		{
			_conn = conn;
		}

		public void ResetFromFixtureSheet(byte[] fixtureSheetBytes)
		{
			var memoryStream = new MemoryStream(fixtureSheetBytes);
			ResetWith(memoryStream);
		}

		public void ResetFromFixtureSheet(string fixtureSheetXls)
		{
			var fixtureSheetFullPath = Path.GetFullPath(fixtureSheetXls);
			var fs = OpenFile(fixtureSheetFullPath);
			if (fs == null)
			{
				throw new ApplicationException(string.Format("Could not load spreadsheet {0}", fixtureSheetFullPath));
			}
			ResetWith(fs);
		}

		private void ResetWith(Stream stream)
		{
			var excelReader = OpenSpreadsheetFrom(stream);
			if (!excelReader.IsValid)
			{
				throw new ApplicationException("Could not load spreadsheet");
			}
			_conn.Open();
			using (_conn)
			{
				using (excelReader)
				{
					ResetFromFixtureSheet(_conn, excelReader);
				}
			}
		}

		private static void ResetFromFixtureSheet(SqlConnectionAdapter conn, IExcelDataReader excelReader)
		{
			var schemas = ReadSchemas(excelReader);

			PopulateAll(conn, schemas);
		}

		private static List<Schema> ReadSchemas(IExcelDataReader excelReader)
		{
			var schemas = new List<Schema>();

			var excelDs = excelReader.AsDataSet();
			var tocDt = excelDs.Tables["TOC"];

			var tableNames = tocDt.ValueOf<string>(0);

			foreach (var tableName in tableNames)
			{
				var schemaDt = excelDs.Tables[tableName + "_schema"];
				if (schemaDt == null)
				{
					continue;
				}

				var schema = new Schema(tableName, schemaDt);
				var dt = excelDs.Tables[schema.TableName + "_data"];
				schema.DataTable = dt;

				schemas.Add(schema);
			}
			return schemas;
		}


		private static void PopulateAll(SqlConnectionAdapter conn, List<Schema> schemas)
		{
			foreach (var sql in schemas.Select(s => "disable trigger all on " + s.TableName))
			{
				conn.ExecuteNonQuery(sql);
			}

			foreach (var sql in from s in schemas where s.HasIdentityKey() select "set identity_insert " + s.TableName + " on")
			{
				conn.ExecuteNonQuery(sql);
			}

			schemas.Reverse();
			foreach (var s in schemas)
			{
				var dt = s.DataTable;
				if (dt == null)
				{
                    var sql = s.AsDeleteAllSql();
                    conn.ExecuteNonQuery(sql);
                    continue;
				}
				foreach (DataRow dr in dt.Rows)
				{
					var sql = s.AsDeleteRowSql(dr);
					conn.ExecuteNonQuery(sql);
				}
			}
			schemas.Reverse();
			foreach (var s in schemas)
			{
				var dt = s.DataTable;
				if(dt == null)
				{
					continue;
				}
				foreach (var sql in from DataRow dr in dt.Rows select s.AsInsertSql(dr))
				{
					conn.ExecuteNonQuery(sql);
				}
			}

			foreach (var sql in from s in schemas where s.HasIdentityKey() select "set identity_insert " + s.TableName + " off")
			{
				conn.ExecuteNonQuery(sql);
			}

			foreach (var sql in schemas.Select(s => "enable trigger all on " + s.TableName))
			{
				conn.ExecuteNonQuery(sql);
			}
		}

		private static IExcelDataReader OpenSpreadsheetFrom(Stream stream)
		{
			var excelReader = ExcelReaderFactory.CreateOpenXmlReader(stream);
			excelReader.IsFirstRowAsColumnNames = true;
			return excelReader;
		}

		private static Stream OpenFile(string file)
		{
			return File.Exists(file) ?
				File.Open(file, FileMode.Open, FileAccess.Read) : 
				null;
		}

	}
}


class Schema
{
	private readonly DataColumn _columnDc;
	private readonly DataColumn _typeDc;
	private readonly DataColumn _keyDc;
	private readonly DataColumn _identityDc;

	private readonly List<ColumnMapping> _columns = new List<ColumnMapping>();

	public Schema(string tableName, DataTable schemaDt)
	{
		TableName = tableName;
		_columnDc = schemaDt.Columns[0];
		_typeDc = schemaDt.Columns[1];
		_keyDc = schemaDt.Columns[2];
		_identityDc = schemaDt.Columns.Count >= 4 ? schemaDt.Columns[3] : null;

		_columns.AddRange(schemaDt.Rows.Cast<DataRow>().
			Where(dr => !string.IsNullOrEmpty(dr[0] as string)).
			Select(dr => new ColumnMapping(dr, _columnDc, _typeDc, _keyDc, _identityDc)));
	}

	public string TableName { get; private set; }

	public string AsInsertSql(DataRow dr)
	{
		var sql = String.Format(
			"insert into {0}({1}) select {2}",
				TableName,
				ColumnNames,
				ColumnValuesFrom(dr));
		return sql;
	}

	public string AsDeleteRowSql(DataRow dr)
	{
		var sql = String.Format(
			"delete from {0} where {1}",
				TableName,
				KeyValuesFrom(dr));
		return sql;
	}

    public string AsDeleteAllSql()
    {
        var sql = String.Format(
            "delete from {0}", TableName);
        return sql;
    }

    public DataTable DataTable { get; set; }

	public List<ColumnMapping> Columns
	{
		get { return _columns; }
	}

	string ColumnNames
	{
		get
		{
			return Columns.Aggregate(
				"", (result, next) => result + (result.Length == 0 ? "" : ", ") + next.Target);
		}
	}

	string ColumnValuesFrom(DataRow dr)
	{
		return Columns.Aggregate(
			"", (result, next) => result + (result.Length == 0 ? "" : ", ") + next.ValueFrom(dr));
	}

	string KeyValuesFrom(DataRow dr)
	{
		return Columns.Where(c => c.Key).Aggregate(
			"", (result, next) => result + (result.Length == 0 ? "" : " AND ") + next.Target + "=" + next.ValueFrom(dr));
	}

	internal class ColumnMapping
	{

		public ColumnMapping(DataRow dataRow, DataColumn targetDc, DataColumn typeDc, DataColumn keyDc, DataColumn identityDc)
		{
			Target = dataRow[targetDc] as string;
			DataType = (typeDc != null ? dataRow[typeDc] : null) as string;
			Key = AsBool(dataRow, keyDc);
			Identity = AsBool(dataRow, identityDc);
		}

		private static bool AsBool(DataRow dr, DataColumn dc)
		{
			if(dc == null) return false;
			var strOrNull = dr[dc] as string;
			var str = strOrNull ?? "";
			return str.ToUpper().StartsWith("Y");
		}

		public string Target { get; private set; }
		public string DataType { get; private set; }
		public bool Key { get; private set; }
		public bool Identity { get; private set; }

		public string ValueFrom(DataRow dr)
		{
			var value = dr[Target];
			switch(DataType)
			{
				case "byte":
					return "" + value;
				case "short":
					return "" + value;
				case "int":
					return "" + value;
                case "long":
					return "" + value;
                case "decimal":
                    return "" + value;
                case "bit":
					return "" + value;
				case "date":
					return "NOW".Equals(value) ? "getdate()" : "'" + value + "'";
				default:
					return "'" + value + "'";
			}
		}
	}

	public bool HasIdentityKey()
	{
		return Columns.Any(c => c.Identity);
	}
}

/// <summary>
/// Introduced so can mocking in tests.
/// </summary>
public interface SqlConnectionAdapter : IDisposable
{
	void Open();
	void ExecuteNonQuery(string sql);
}

public class SqlConnectionAdapterUsingSqlConnection: SqlConnectionAdapter
{
	private readonly SqlConnection _sqlConnection;

	public SqlConnectionAdapterUsingSqlConnection(SqlConnection sqlConnection)
	{
		_sqlConnection = sqlConnection;
	}

	public void Dispose()
	{
		_sqlConnection.Dispose();
	}

	public void Open()
	{
		_sqlConnection.Open();
	}

	public void ExecuteNonQuery(string sql)
	{
		try
		{
			_sqlConnection.ExecuteNonQuery(sql);
		}
		catch (SqlException ex)
		{
			throw new Exception(sql, ex);
		};
	}
}
