using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Common.DTO;
using Common.Model;

namespace Common.AutoMapper
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<UserDTO, User>()
                .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => src.username))
                .ForMember(dest => dest.RowKey, opt => opt.MapFrom(src => src.username))
                .ForMember(dest => dest.password, opt => opt.MapFrom<PasswordHashResolver>());
        }
    }
}
