using Microsoft.EntityFrameworkCore;
using BugLens.Api.Models;

namespace BugLens.Api.Data
{
    public class BugLensDbContext : DbContext
    {
        public BugLensDbContext(DbContextOptions<BugLensDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).HasConversion<string>(); // Store enum as string
            });
        }
    }
}
