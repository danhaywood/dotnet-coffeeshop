using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Demo.Util
{
    public class Comparer<T> : IComparer<T>
    {
        private readonly Func<T, T, int> _compareFn;

        public static Comparer<T> Using(Func<T, T, int> fn)
        {
            return new Comparer<T>(fn);
        }

        public Comparer(Func<T, T, int> fn)
        {
            _compareFn = fn;
        }

        public int Compare(T x, T y)
        {
            return _compareFn(x, y);
        }

    }

    public class EqualityComparer<T> : IEqualityComparer<T>
    {
        private readonly Func<T, T, bool> _equalsFn;
        private readonly Func<T, int> _getHashCodefn;

        public static EqualityComparer<T> Using(Func<T, T, bool> equalsFn, Func<T, int> getHashCodefn)
        {
            return new EqualityComparer<T>(equalsFn, getHashCodefn);
        }

        public EqualityComparer(Func<T, T, bool> equalsFn, Func<T, int> getHashCodefn)
        {
            _equalsFn = equalsFn;
            _getHashCodefn = getHashCodefn;
        }

        public bool Equals(T x, T y)
        {
            return _equalsFn(x, y);
        }

        public int GetHashCode(T obj)
        {
            return _getHashCodefn(obj);
        }
    }

}
