using Greenthumb.Models;
using System;
using System.Linq;

namespace Greenthumb.Data
{
    public static class DbInitializer
    {
        public static void Initialize(GreenthumbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }

            var plants = new Plant[]
            {
                        new Plant { PlantID = 1, Location = "front yard", Name = "Aster", Description = "blue, white, red", Quantity = 6 },
                        new Plant { PlantID = 2, Location = "back yard", Name = "Rasberry", Description = "vines", Quantity = 10 },
                        new Plant { PlantID = 3, Location = "front yard", Name = "Tomatoes", Description = "cherry", Quantity = 4 }
            };
            foreach (Plant p in plants)
            {
                context.Plants.Add(p);
            }
            context.SaveChanges();

            var users = new User[]
            {
                        new User { ID=1, LastName = "Johnson", FirstName = "John",  SignupDate = DateTime.Parse("2018-09-01") },
                        new User { ID=2, LastName = "Doe", FirstName = "Jane", SignupDate = DateTime.Parse("2019-05-15") },
                        new User { ID=3, LastName = "Smith", FirstName = "Michael",  SignupDate = DateTime.Parse("2020-02-10") }
            };
            foreach (User u in users)
            {
                context.Users.Add(u);
            }
            context.SaveChanges();

            var cares = new Care[]
            {
                        new Care { CareID = 1, Watering = "daily", Light = "full", Soil = "well-drained" },
                        new Care { CareID = 2, Watering = "weekly", Light = "partial", Soil = "acidic" },
                        new Care { CareID = 3, Watering = "bi-weekly", Light = "full", Soil = "well-drained" }
            };
            foreach (Care c in cares)
            {
                context.Cares.Add(c); 
            }
            context.SaveChanges();
        }
    }
}