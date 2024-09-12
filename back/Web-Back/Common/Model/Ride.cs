using Azure;
using Azure.Data.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Model
{
    public class Ride : ITableEntity
    {
        public string user { get; set; }
        public string driver { get; set; }
        public int rating { get; set; }
        public string startaddress { get; set; }
        public string destaddress { get; set; }
        public double price { get; set; }
        public double distance { get; set; }
        public DateTime starttime { get; set; }
        public DateTime arrivetime { get; set; }
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }
}
