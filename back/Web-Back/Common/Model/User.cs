using Azure;
//using Microsoft.WindowsAzure.Storage.Table;
using Azure.Data.Tables;
using Common.DTO;

namespace Common.Model
{
    public class User : ITableEntity
    {
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public DateTime birthdate { get; set; }
        public string address { get; set; }
        public UserType usertype { get; set; }
        public string imageBlobLink { get; set; }
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }
}
