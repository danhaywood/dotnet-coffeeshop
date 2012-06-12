using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;

namespace Demo.Util
{
    public static class DataTableStreamExtensions
    {
        public static List<T> ValueOf<T>(this DataTable tocDt, int columnIndex) where T:class 
        {
            return (from DataRow dr in tocDt.Rows select dr[columnIndex] as T).ToList();
        }
    }
}
