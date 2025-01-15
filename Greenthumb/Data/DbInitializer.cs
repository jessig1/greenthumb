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

        var cares = new Care[]
        {
        new Care { CareID = 7, Watering = "daily", Light = "full", Soil = "well-drained" },
        new Care { CareID = 8, Watering = "weekly", Light = "partial", Soil = "acidic" },
        new Care { CareID = 9,  Watering = "bi-weekly", Light = "full", Soil = "well-drained" }
        };
        foreach (Care c in cares)
        {
            context.Cares.Add(c);
        }
        context.SaveChanges();

        var users = new DisplayFormat[]
        {
        new DisplayFormat { LastName = "Johnson", FirstName = "John",  SignupDate = DateTime.Parse("2018-09-01") },
        new DisplayFormat { LastName = "Doe", FirstName = "Jane", SignupDate = DateTime.Parse("2019-05-15") },
        new DisplayFormat { LastName = "Smith", FirstName = "Michael",  SignupDate = DateTime.Parse("2020-02-10") }
        };
        foreach (DisplayFormat u in users)
        {
            context.Users.Add(u);
        }
        context.SaveChanges();

        var plants = new Plant[]
        {
        new Plant { UserID=1, CareID=1, Location = "front yard", Name = "Aster", Description = "blue, white, red", Quantity = 6 },
        new Plant { UserID=2, CareID=2, Location = "back yard", Name = "Rasberry", Description = "vines", Quantity = 10 },
        new Plant { UserID=3, CareID=3, Location = "front yard", Name = "Tomatoes", Description = "cherry", Quantity = 4 }
        };
        foreach (Plant p in plants)
        {
            context.Plants.Add(p);
        }
        context.SaveChanges();
    }
}

}
