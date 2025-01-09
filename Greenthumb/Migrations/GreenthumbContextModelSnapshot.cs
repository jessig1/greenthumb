﻿// <auto-generated />
using System;
using Greenthumb.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Greenthumb.Migrations
{
    [DbContext(typeof(GreenthumbContext))]
    partial class GreenthumbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Greenthumb.Models.Care", b =>
                {
                    b.Property<int>("CareID")
                        .HasColumnType("int");

                    b.Property<string>("Light")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Soil")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Watering")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("CareID");

                    b.ToTable("Care", (string)null);
                });

            modelBuilder.Entity("Greenthumb.Models.Plant", b =>
                {
                    b.Property<int>("PlantID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PlantID"));

                    b.Property<int>("CareID")
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<int>("UserID")
                        .HasColumnType("int");

                    b.HasKey("PlantID");

                    b.HasIndex("CareID");

                    b.HasIndex("UserID");

                    b.ToTable("Plant", (string)null);
                });

            modelBuilder.Entity("Greenthumb.Models.User", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("SignupDate")
                        .HasColumnType("datetime2");

                    b.HasKey("ID");

                    b.ToTable("User", (string)null);
                });

            modelBuilder.Entity("Greenthumb.Models.Plant", b =>
                {
                    b.HasOne("Greenthumb.Models.Care", "Care")
                        .WithMany("Plants")
                        .HasForeignKey("CareID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Greenthumb.Models.User", "User")
                        .WithMany("Plants")
                        .HasForeignKey("UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Care");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Greenthumb.Models.Care", b =>
                {
                    b.Navigation("Plants");
                });

            modelBuilder.Entity("Greenthumb.Models.User", b =>
                {
                    b.Navigation("Plants");
                });
#pragma warning restore 612, 618
        }
    }
}
