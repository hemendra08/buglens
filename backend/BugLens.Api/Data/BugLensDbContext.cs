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
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Evidence> Evidences { get; set; }
        public DbSet<InvestigationNote> InvestigationNotes { get; set; }

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

            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Bug)
                      .WithMany(b => b.Comments)
                      .HasForeignKey(e => e.BugId)
                      .OnDelete(DeleteBehavior.Cascade); // Delete comments when bug is deleted

                entity.HasOne(e => e.Author)
                      .WithMany()
                      .HasForeignKey(e => e.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Owner)
                      .WithMany()
                      .HasForeignKey(e => e.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Bugs)
                      .WithOne(b => b.Project)
                      .HasForeignKey(b => b.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Evidence>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Bug)
                      .WithMany(b => b.Evidences)
                      .HasForeignKey(e => e.BugId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.UploadedBy)
                      .WithMany()
                      .HasForeignKey(e => e.UploadedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<InvestigationNote>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Bug)
                      .WithMany(b => b.InvestigationNotes)
                      .HasForeignKey(e => e.BugId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Author)
                      .WithMany()
                      .HasForeignKey(e => e.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
