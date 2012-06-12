using System.Collections.Generic;
using System.IO;

namespace Demo.Util
{
    public static class FileStreamExtensions
    {
        public static List<string> ReadLines(this FileStream fileStream)
        {
            if (fileStream == null)
            {
                return null;
            }
            var lines = new List<string>();
            var streamReader = new StreamReader(fileStream);
            using (streamReader)
            {
                string tableName;
                while ((tableName = streamReader.ReadLine()) != null)
                {
                    if (tableName.StartsWith("#"))
                    {
                        continue;
                    }
                    lines.Add(tableName);
                }
            }
            return lines;
        }
    }
}
