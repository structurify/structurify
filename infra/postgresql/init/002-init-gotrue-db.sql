CREATE USER gotrue WITH PASSWORD 'gotrue';
CREATE DATABASE gotrue OWNER gotrue;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION gotrue;