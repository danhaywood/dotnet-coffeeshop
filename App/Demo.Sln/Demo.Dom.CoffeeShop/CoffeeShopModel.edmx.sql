
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, and Azure
-- --------------------------------------------------
-- Date Created: 06/12/2012 22:29:32
-- Generated from EDMX file: D:\GITHUB\danhaywood\dotnet-coffeeshop\App\Demo.Sln\Demo.Dom.CoffeeShop\CoffeeShopModel.edmx
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
IF OBJECT_ID(N'[dbo].[FK_Order_OrderAddition]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[OrderAdditions] DROP CONSTRAINT [FK_Order_OrderAddition];
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
    [OrderNum] int IDENTITY(1,1) NOT NULL,
    [DrinkSku] nchar(8)  NOT NULL,
    [Price] decimal(8,2)  NOT NULL,
    [CustomerName] nvarchar(max)  NOT NULL,
    [CustomerState] tinyint  NOT NULL,
    [BaristaState] tinyint  NOT NULL,
    [PlacedOn] datetime  NOT NULL
);
GO

-- Creating table 'OrderAdditions'
CREATE TABLE [dbo].[OrderAdditions] (
    [OrderNum] int  NOT NULL,
    [ProductSku] nchar(8)  NOT NULL
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

-- Creating primary key on [OrderNum] in table 'Orders'
ALTER TABLE [dbo].[Orders]
ADD CONSTRAINT [PK_Orders]
    PRIMARY KEY CLUSTERED ([OrderNum] ASC);
GO

-- Creating primary key on [OrderNum], [ProductSku] in table 'OrderAdditions'
ALTER TABLE [dbo].[OrderAdditions]
ADD CONSTRAINT [PK_OrderAdditions]
    PRIMARY KEY NONCLUSTERED ([OrderNum], [ProductSku] ASC);
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

-- Creating non-clustered index for FOREIGN KEY 'FK_OrderAdditions_Product'
CREATE INDEX [IX_FK_OrderAdditions_Product]
ON [dbo].[OrderAdditions]
    ([ProductSku]);
GO

-- Creating foreign key on [OrderNum] in table 'OrderAdditions'
ALTER TABLE [dbo].[OrderAdditions]
ADD CONSTRAINT [FK_Order_OrderAddition]
    FOREIGN KEY ([OrderNum])
    REFERENCES [dbo].[Orders]
        ([OrderNum])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------