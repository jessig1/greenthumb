using Greenthumb.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Greenthumb.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly Data.GreenthumbContext _context;

        public HomeController(ILogger<HomeController> logger, Data.GreenthumbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<ActionResult> About()
        {
            IQueryable<Models.GreenthumbViewModels.EnrollmentDateGroup> data =
                from user in _context.Users
                group user by user.SignupDate into dateGroup
                select new Models.GreenthumbViewModels.EnrollmentDateGroup()
                {
                    SignupDate = dateGroup.Key,
                    UserCount = dateGroup.Count()
                };
            return View(await data.AsNoTracking().ToListAsync());
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
