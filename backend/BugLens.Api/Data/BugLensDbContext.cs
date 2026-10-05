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
        public DbSet<Bug> Bugs { get; set; }

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

            modelBuilder.Entity<Bug>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // Store Enums as Strings
                entity.Property(e => e.Status).HasConversion<string>();
                entity.Property(e => e.Priority).HasConversion<string>();

                // CreatedBy Relationship
                entity.HasOne(e => e.CreatedBy)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedById)
                      .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a user if they created a bug

                // AssignedTo Relationship
                entity.HasOne(e => e.AssignedTo)
                      .WithMany()
                      .HasForeignKey(e => e.AssignedToId)
                      .OnDelete(DeleteBehavior.SetNull); // Allow assigning bug to NULL if user is deleted
            });
        }
    }
}
