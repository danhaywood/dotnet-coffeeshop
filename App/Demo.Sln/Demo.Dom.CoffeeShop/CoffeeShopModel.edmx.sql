
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, and Azure
-- --------------------------------------------------
-- Date Created: 06/12/2012 12:01:40
-- Generated from EDMX file: D:\GITHUB\danhaywood\nomvc-ronet-demo\App\Demo.Sln\Demo.Dom.CoffeeShop\CoffeeShopModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [CoffeeShop];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[FK_Order_Drink]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Orders] DROP CONSTRAINT [FK_Order_Drink];
GO
IF OBJECT_ID(N'[dbo].[FK_OrderAdditions_Product]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[OrderAdditions] DROP CONSTRAINT [FK_OrderAdditions_Product];
GO
IF OBJECT_ID(N'[dbo].[FK_Order_OrderAdditions]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[OrderAdditions] DROP CONSTRAINT [FK_Order_OrderAdditions];
GO

-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[Products]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Products];
GO
IF OBJECT_ID(N'[dbo].[Orders]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Orders];
GO
IF OBJECT_ID(N'[dbo].[OrderAdditions]', 'U') IS NOT NULL
    DROP TABLE [dbo].[OrderAdditions];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'Products'
CREATE TABLE [dbo].[Products] (
    [Sku] nchar(8)  NOT NULL,
    [Name] nvarchar(30)  NOT NULL,
    [Price] decimal(8,2)  NOT NULL,
    [Addition] bit  NOT NULL
);
GO

-- Creating table 'Orders'
CREATE TABLE [dbo].[Orders] (
    [OrderId] uniqueidentifier  NOT NULL,
    [DrinkSku] nchar(8)  NOT NULL,
    [Price] decimal(8,2)  NOT NULL,
    [CustomerState] tinyint  NOT NULL,
    [BaristaState] tinyint  NOT NULL,
    [CustomerName] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'OrderAdditions'
CREATE TABLE [dbo].[OrderAdditions] (
    [ProductSku] nchar(8)  NOT NULL,
    [OrderId] uniqueidentifier  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Sku] in table 'Products'
ALTER TABLE [dbo].[Products]
ADD CONSTRAINT [PK_Products]
    PRIMARY KEY CLUSTERED ([Sku] ASC);
GO

-- Creating primary key on [OrderId] in table 'Orders'
ALTER TABLE [dbo].[Orders]
ADD CONSTRAINT [PK_Orders]
    PRIMARY KEY CLUSTERED ([OrderId] ASC);
GO

-- Creating primary key on [ProductSku], [OrderId] in table 'OrderAdditions'
ALTER TABLE [dbo].[OrderAdditions]
ADD CONSTRAINT [PK_OrderAdditions]
    PRIMARY KEY NONCLUSTERED ([ProductSku], [OrderId] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [DrinkSku] in table 'Orders'
ALTER TABLE [dbo].[Orders]
ADD CONSTRAINT [FK_Order_Drink]
    FOREIGN KEY ([DrinkSku])
    REFERENCES [dbo].[Products]
        ([Sku])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Creating non-clustered index for FOREIGN KEY 'FK_Order_Drink'
CREATE INDEX [IX_FK_Order_Drink]
ON [dbo].[Orders]
    ([DrinkSku]);
GO

-- Creating foreign key on [ProductSku] in table 'OrderAdditions'
ALTER TABLE [dbo].[OrderAdditions]
ADD CONSTRAINT [FK_OrderAdditions_Product]
    FOREIGN KEY ([ProductSku])
    REFERENCES [dbo].[Products]
        ([Sku])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating foreign key on [OrderId] in table 'OrderAdditions'
ALTER TABLE [dbo].[OrderAdditions]
ADD CONSTRAINT [FK_Order_OrderAdditions]
    FOREIGN KEY ([OrderId])
    REFERENCES [dbo].[Orders]
        ([OrderId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Creating non-clustered index for FOREIGN KEY 'FK_Order_OrderAdditions'
CREATE INDEX [IX_FK_Order_OrderAdditions]
ON [dbo].[OrderAdditions]
    ([OrderId]);
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------