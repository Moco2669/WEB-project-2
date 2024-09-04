using AutoMapper;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Common;
using Common.AutoMapper;
using Common.DTO;
using Common.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stateless1
{
    public class UserStorageService : StatelessService, IUserStorageService
    {
        private readonly AzureStorageService storage;
        private readonly IMapper mapper;
        private TableClient tableClient;
        private BlobContainerClient blobContainerClient;

        public UserStorageService(StatelessServiceContext context) : base(context)
        {
            storage = new AzureStorageService();
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<UserProfile>();
            });
            mapper = config.CreateMapper();
            tableClient = storage.GetTable("Users");
            blobContainerClient = storage.GetBlobContainer("userimages");
        }

        public async Task<UserDTO> GetUser(string username)
        {
            try
            {
                var result = tableClient.GetEntityIfExists<User>(username, username);
                if (!result.HasValue) { return null; }

                var userEntity = result.Value;
                var userDto = mapper.Map<UserDTO>(userEntity);
                return userDto;
            } catch (Exception ex)
            {
                throw new InvalidOperationException("Error when getting user", ex);
            }
        }

        public async Task<IFormFile> GetUserImage(string imageBlobLink)
        {
            try
            {
                var blob = blobContainerClient.GetBlobClient(imageBlobLink);
                var imageStream = blob.OpenRead();
                IFormFile image = null;
                using (var memoryStream = new MemoryStream())
                {
                    imageStream.CopyTo(memoryStream);
                    image = new FormFile(memoryStream, 0, memoryStream.Length, imageBlobLink, imageBlobLink);
                }
                return image;
            } catch(Exception ex)
            {
                throw new InvalidOperationException("Error when getting image", ex);
            }
        }

        public Task InsertUser(UserDTO userDTO)
        {
            throw new NotImplementedException();
        }
    }
}
