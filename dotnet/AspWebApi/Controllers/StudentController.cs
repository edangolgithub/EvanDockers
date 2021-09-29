using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AspWebApi.Controllers
{

[ApiController]
[Route("[controller]")]
public class StudentController : ControllerBase
{


    private readonly ILogger<StudentController> _logger;
    private readonly SchoolDbContext _context;
    public StudentController(ILogger<StudentController> logger, SchoolDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    public async Task<IEnumerable<Student>> GetAsync()
    {
        try
        {
            var data = await _context.Students.ToListAsync();

            return data;
        }
        catch (Exception)
        {
            throw;
        }
    }
    [HttpPost]
    public async Task<int> Add(Student s)
    {
        _context.Students.Add(s);
        await _context.SaveChangesAsync();
        return s.Id;

    }
}
}