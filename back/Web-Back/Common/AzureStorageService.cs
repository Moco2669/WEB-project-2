using Azure.Data.Tables;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Queues;

namespace Common
{
    public class AzureStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly QueueServiceClient _queueServiceClient;
        private readonly TableServiceClient _tableServiceClient;

        public AzureStorageService()
        {
            _blobServiceClient = new BlobServiceClient("UseDevelopmentStorage=true");
            _queueServiceClient = new QueueServiceClient("UseDevelopmentStorage=true");
            _tableServiceClient = new TableServiceClient("UseDevelopmentStorage=true");
        }

        public BlobContainerClient GetBlobContainer(string containerName)
        {
            var blobClient = _blobServiceClient.GetBlobContainerClient(containerName);
            try
            {
                blobClient.CreateIfNotExists();
            } catch(Exception e)
            {
                return _blobServiceClient.GetBlobContainerClient(containerName);
            }
            return _blobServiceClient.GetBlobContainerClient(containerName);
        }

        public BlobClient GetBlob(string containerName, string blobName)
        {
            var containerClient = GetBlobContainer(containerName);
            return containerClient.GetBlobClient(blobName);
        }
        public TableClient GetTable(string tableName)
        {
            var tableClient = _tableServiceClient.GetTableClient(tableName);
            try
            {
                tableClient.CreateIfNotExists();
            } catch(Exception e)
            {
                return _tableServiceClient.GetTableClient(tableName);
            }
            return tableClient;
        }

        public async Task<Response<TableEntity>> GetTableEntryAsync(string tableName, string partitionKey, string rowKey)
        {
            var tableClient = GetTable(tableName);
            return await tableClient.GetEntityAsync<TableEntity>(partitionKey, rowKey);
        }

        public QueueClient GetQueue(string queueName)
        {
            return _queueServiceClient.GetQueueClient(queueName);
        }
    }
}
