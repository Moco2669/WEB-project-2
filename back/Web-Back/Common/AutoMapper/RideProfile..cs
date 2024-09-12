using AutoMapper;
using Common.DTO;
using Common.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.AutoMapper
{
    public class RideProfile : Profile
    {
        public RideProfile()
        {
            CreateMap<RideDTO, Ride>()
                .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => src.driver))
                .ForMember(dest => dest.RowKey, opt => opt.MapFrom(src => Guid.NewGuid().ToString()));
        }
    }
}
