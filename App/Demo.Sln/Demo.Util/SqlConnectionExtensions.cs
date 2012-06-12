using System.Data.SqlClient;

namespace Demo.Util
{
    public static class SqlConnectionExtensions
    {
        public static void DeleteAllFrom(this SqlConnection conn, string tableName)
        {
            conn.ExecuteNonQuery("delete from " + tableName);
        }

        public static void ExecuteNonQuery(this SqlConnection conn, string commandText)
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = commandText;
            cmd.ExecuteNonQuery();
        }
    }
}
