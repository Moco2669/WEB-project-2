using AutoMapper;
using Common.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using Common.Model;

namespace Common.AutoMapper
{
    public class PasswordHashResolver : IValueResolver<UserDTO, User, string>
    {
        public string Resolve(UserDTO source, User destination, string destMember, ResolutionContext context)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(source.password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }
    }
}
