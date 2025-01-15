using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Greenthumb.Models;

namespace Greenthumb.Data
{
    public class GreenthumbContext : DbContext
    {
        public GreenthumbContext (DbContextOptions<GreenthumbContext> options)
            : base(options)
        {
        }

        public DbSet<DisplayFormat> Users { get; set; }
        public DbSet<Plant> Plants { get; set; }
        public DbSet<Care> Cares { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DisplayFormat>().ToTable("User");
            modelBuilder.Entity<Plant>().ToTable("Plant");
            modelBuilder.Entity<Care>().ToTable("Care");
        }
    }
}
