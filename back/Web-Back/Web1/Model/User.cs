using System.Fabric.Common.Tracing;
using System.Fabric.Management.ServiceModel;
using Microsoft.WindowsAzure.Storage.Table;

namespace Web1.Model
{
    public class User : TableEntity
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public UserType UserType { get; set; }
        public string ImageBlobLink { get; set; }
    }

    public enum UserType
    {
        ADMIN, USER, DRIVER
    }
}
