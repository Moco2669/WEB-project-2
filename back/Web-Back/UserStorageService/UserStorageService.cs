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
                VerifyStatus status = VerifyStatus.Verified;
                var result = usersTableClient.GetEntityIfExists<User>(username, username);
                if (!result.HasValue)
                {
                    status = VerifyStatus.Waiting;
                    result = newUsersTableClient.GetEntityIfExists<User>(username, username);
                    if (!result.HasValue)
                    {
                        status = VerifyStatus.Rejected;
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
                userDto.imagebase64 = await GetUserImage(userEntity.imageBlobLink);
                userDto.verifystatus = status;

                return userDto;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when getting user", ex);
            }
        }

        public async Task<string> GetUserImage(string imageBlobLink)
        {
            try
            {
                var blob = blobContainerClient.GetBlobClient(imageBlobLink);
                var imageStream = blob.OpenRead();
                string imageString = "";
                using (var memoryStream = new MemoryStream())
                {
                    imageStream.CopyTo(memoryStream);
                    imageString = Convert.ToBase64String(memoryStream.ToArray());
                }
                return imageString;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when getting image", ex);
            }
        }

        public async Task<string> InsertUserImage(byte[] imageArray, string fileName)
        {
            try
            {
                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
                var blob = blobContainerClient.GetBlobClient(uniqueFileName);
                using(var stream = new MemoryStream(imageArray))
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

        public async Task<List<UserDTO>> GetAllDrivers()
        {
            try
            {
                List<User> users = newUsersTableClient.Query<User>().ToList();
                List<UserDTO> userDTOs = new List<UserDTO>();
                foreach (User user in users)
                {
                    var userDto = mapper.Map<User, UserDTO>(user);
                    userDto.verifystatus = VerifyStatus.Waiting;
                    userDTOs.Add(userDto);
                }
                List<User> verifiedUsers = usersTableClient.Query<User>().ToList();
                foreach (User user in verifiedUsers)
                {
                    if(user.usertype == UserType.Driver)
                    {
                        var userDto = mapper.Map<User, UserDTO>(user);
                        userDto.verifystatus = VerifyStatus.Verified;
                        // TODO: CALCULATE AVG RATING
                        userDTOs.Add(userDto);
                    }
                }
                List<User> rejectedUsers = rejectedUsersTableClient.Query<User>().ToList();
                foreach (User user in rejectedUsers)
                {
                    var userDto = mapper.Map<User, UserDTO>(user);
                    userDto.verifystatus = VerifyStatus.Rejected;
                    userDTOs.Add(userDto);
                }
                return userDTOs;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when getting all drivers", ex);
            }
        }
        public async Task<UserDTO> ValidateUser(string username)
        {
            try
            {
                bool isAlreadyRejected = false;
                var result = newUsersTableClient.GetEntityIfExists<User>(username, username);
                if (!result.HasValue)
                {
                    result = rejectedUsersTableClient.GetEntityIfExists<User>(username, username);
                    if(!result.HasValue)
                    {
                        throw new Exception("User doesn't exist");
                    }
                    isAlreadyRejected = true;
                }
                var userEntity = result.Value;
                var userDto = mapper.Map<User, UserDTO>(userEntity);
                userDto.verifystatus = VerifyStatus.Verified;
                if (!isAlreadyRejected)
                {
                    var result1 = newUsersTableClient.DeleteEntity(userEntity);
                    if (result1.IsError) { return null; }
                }
                else
                {
                    var result1 = rejectedUsersTableClient.DeleteEntity(userEntity);
                    if (result1.IsError) { return null; }
                }
                var result2 = usersTableClient.AddEntity<User>(userEntity);
                if (result2.IsError) { return null; }
                return userDto;
            }
            catch(Exception ex)
            {
                throw new InvalidOperationException("Error validating user", ex);
            }
        }

        public async Task<bool> RejectUser(string username)
        {
            try
            {
                bool removedFromRegularTable = false;
                var result = newUsersTableClient.GetEntityIfExists<User>(username, username);
                if (!result.HasValue)
                {
                    result = usersTableClient.GetEntityIfExists<User>(username, username);
                    if (!result.HasValue) { throw new Exception("User doesn't exist"); }
                    removedFromRegularTable = true;
                }
                var userEntity = result.Value;
                if (!removedFromRegularTable)
                {
                    var result1 = newUsersTableClient.DeleteEntity(userEntity);
                    if (result1.IsError) { return false; }
                }
                else
                {
                    var result1 = usersTableClient.DeleteEntity(userEntity);
                    if (result1.IsError) { return false; }
                }
                var result2 = rejectedUsersTableClient.AddEntity<User>(userEntity);
                if (result2.IsError) { return false; }
                return true;
            }
            catch(Exception ex)
            {
                throw new InvalidOperationException("Error when rejecing user", ex);
            }
        }

        public byte[] ConvertIFormFileToByteArray(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            using (var memoryStream = new MemoryStream())
            {
                file.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}
