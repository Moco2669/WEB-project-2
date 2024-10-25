﻿using Common.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Common
{
    public interface IUserStorageService : IService
    {
        public Task<bool> InsertUser(UserDTO userDTO, string imageBlobLink);
        public Task<bool> InsertDriver(UserDTO userDTO, string imageBlobLink);
        public Task<string> InsertUserImage(byte[] imageArray, string imageName);
        public Task<UserDTO> GetUser(string username);
        public Task<List<UserDTO>> GetWaitingUsers();
        public Task<List<UserDTO>> GetAllDrivers();
        public Task<string> GetUserImage(string imageBlobLink);
        public Task<UserDTO> ValidateUser(string username);
        public Task<bool> RejectUser(string username);
        public Task<bool> UpdateUser(UserDTO3 userDTO, string username);
        public Task<bool> UpdateUserAndImage(UserDTO3 userDTO, string imageBlobLink, string username);
    }
}
