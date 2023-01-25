using Microsoft.EntityFrameworkCore;
using redis.Controllers;
using StackExchange.Redis;

//ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("redis-11704.c270.us-east-1-3.ec2.cloud.redislabs.com:11704,password=redispasswpord");
//var db=redis.GetDatabase();

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddScoped<MyDbContext>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IRedisCacheService, RedisCacheService>();

builder.Services.AddDbContext<MyDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("ConnStr")));
builder.Services.AddStackExchangeRedisCache(options => { options.Configuration = builder.Configuration["RedisCacheUrl"]; });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
