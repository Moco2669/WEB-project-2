using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Common;
using Common.AutoMapper;
using Common.DTO;
using Common.Model;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.V2.FabricTransport.Runtime;

namespace UserStorageService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class UserStorageService : StatelessService, IUserStorageService
    {
        private readonly AzureStorageService storage;
        private readonly IMapper mapper;
        private TableClient usersTableClient;
        private TableClient newUsersTableClient;
        private TableClient rejectedUsersTableClient;
        private BlobContainerClient blobContainerClient;

        public UserStorageService(StatelessServiceContext context) : base(context)
        {
            storage = new AzureStorageService();
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<UserProfile>();
            });
            mapper = config.CreateMapper();
            usersTableClient = storage.GetTable("Users");
            newUsersTableClient = storage.GetTable("NewUsers");
            rejectedUsersTableClient = storage.GetTable("RejectedUsers");
            blobContainerClient = storage.GetBlobContainer("userimages");
        }

        /// <summary>
        /// Optional override to create listeners (e.g., TCP, HTTP) for this service replica to handle client or user requests.
        /// </summary>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        public async Task<UserDTO> GetUser(string username)
        {
            try
            {
                var result = usersTableClient.GetEntityIfExists<User>(username, username);
                if (!result.HasValue)
                {
                    result = newUsersTableClient.GetEntityIfExists<User>(username, username);
                    if (!result.HasValue)
                    {
                        result = rejectedUsersTableClient.GetEntityIfExists<User>(username, username);
                        if (!result.HasValue)
                        {
                            return null;
                        }
                    }
                }

                var userEntity = result.Value;
                var userDto = mapper.Map<UserDTO>(userEntity);
                if(userEntity.imageBlobLink == null) { return userDto; }
                userDto.image = await GetUserImage(userEntity.imageBlobLink);

                return userDto;
            }
            catch (Exception ex)
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
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when getting image", ex);
            }
        }

        public async Task<string> InsertUserImage(IFormFile image)
        {
            try
            {
                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var blob = blobContainerClient.GetBlobClient(uniqueFileName);
                using(var stream = image.OpenReadStream())
                {
                    blob.Upload(stream);
                }
                return uniqueFileName;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when inserting image", ex);
            }
        }

        public async Task<bool> InsertDriver(UserDTO userDTO, string imageBlobLink)
        {
            try
            {
                var userEntity = mapper.Map<UserDTO, User>(userDTO);
                userEntity.imageBlobLink = imageBlobLink;
                var result = newUsersTableClient.AddEntity<User>(userEntity);
                if (result.IsError) { return false; }
                return true;
            }
            catch(Exception ex)
            {
                throw new InvalidOperationException("Error when inserting driver", ex);
            }
        }

        public async Task<bool> InsertUser(UserDTO userDTO, string imageBlobLink)
        {
            try
            {
                var userEntity = mapper.Map<UserDTO, User>(userDTO);
                userEntity.imageBlobLink = imageBlobLink;
                var result = usersTableClient.AddEntity<User>(userEntity);
                if (result.IsError) { return false; }
                return true;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when inserting user", ex);
            }
        }

        public async Task<List<UserDTO>> GetWaitingUsers()
        {
            try
            {
                List<User> users = newUsersTableClient.Query<User>().ToList();
                List<UserDTO> userDTOs = new List<UserDTO>();
                foreach(User user in users)
                {
                    var userDto = mapper.Map<User, UserDTO>(user);
                    userDTOs.Add(userDto);
                }
                return userDTOs;
            } catch (Exception ex)
            {
                throw new InvalidOperationException("Error getting waiting users", ex);
            }
        }

        public async Task<bool> ValidateUser(string username)
        {
            try
            {
                var result = newUsersTableClient.GetEntityIfExists<User>(username, username);
                if (!result.HasValue) { throw new Exception("User doesn't exist"); }
                var userEntity = result.Value;
                var result1 = newUsersTableClient.DeleteEntity(userEntity);
                if (result1.IsError) { return false; }
                result1 = usersTableClient.AddEntity<User>(userEntity);
                if (result1.IsError) { return false; }
                return true;
            } catch(Exception ex)
            {
                throw new InvalidOperationException("Error validating user", ex);
            }
        }
    }
}