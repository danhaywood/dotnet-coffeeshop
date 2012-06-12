using System;
using System.Linq;

namespace Demo.Util
{
    public static class StringExtensions
    {

        public static string Else(this string x, string y)
        {
            return x ?? y;
        }

        public static bool IsNullOrEmpty(this string str)
        {
            return string.IsNullOrEmpty(str);
        }

        private static string UrlCombineTwo(this string url1, string url2)
        {
            if (url1.Length == 0)
            {
                return url2;
            }

            if (url2.Length == 0)
            {
                return url1;
            }

            url1 = url1.TrimEnd("/\\".ToCharArray());
            url2 = url2.TrimStart("/\\".ToCharArray());

            return string.Format("{0}/{1}", url1, url2);
        }

        public static string UrlAnd(this string url1, params string[] urls)
        {
            if (urls == null || urls.Length == 0)
            {
                throw new ArgumentException("one or more urls must be provided to combine");
            }

            return urls.Aggregate(url1, (current, url) => UrlCombineTwo(current, url));
        }


    
    }

}
