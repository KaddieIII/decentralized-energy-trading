CREATE SCHEMA IF NOT EXISTS public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE TABLE IF NOT EXISTS public.exchange_account (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    address character varying NOT NULL
);

INSERT INTO public.exchange_account (id, "userId", address) VALUES ('d24531e8-a14e-48fb-9434-06dfef292d6d', '2', '0x4dc3c0838CB50dbA753f3aE583a61655019c40e1');

CREATE TABLE IF NOT EXISTS public.exchange_asset (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    address character varying NOT NULL,
    "tokenId" character varying NOT NULL,
    "deviceId" character varying NOT NULL,
    "generationFrom" timestamp with time zone NOT NULL,
    "generationTo" timestamp with time zone NOT NULL
);

INSERT INTO public.exchange_asset (id, address, "tokenId", "deviceId", "generationFrom", "generationTo") VALUES ('e7ce7521-aea0-49a0-bed3-deb7db357cd2', '0x9876', '0', '0', '2020-01-01T00:00:00.000Z', '2020-01-31T00:00:00.000Z');
INSERT INTO public.exchange_asset (id, address, "tokenId", "deviceId", "generationFrom", "generationTo") VALUES ('2c0fd5e0-a819-4d6a-bfde-e24343d9d679', '0x9876', '1', '1', '2020-01-01T00:00:00.000Z', '2020-01-31T00:00:00.000Z');

CREATE TABLE IF NOT EXISTS public.exchange_demand (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    price integer NOT NULL,
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    "volumePerPeriod" bigint NOT NULL,
    "periodTimeFrame" character varying NOT NULL,
    product json NOT NULL,
    "status" character varying NOT NULL
);

INSERT INTO public.exchange_demand (id, "userId", price, start, "end", "volumePerPeriod", "periodTimeFrame", product, "status") 
VALUES (
    '87406dfd-1757-4ef9-ab28-c89ab8dadf90',     -- id (uuid)
    '1',                                        -- userId (character varying NOT NULL)
    1000,                                       -- price (integer NOT NULL)
    '2020-03-04 11:20:05.171441+00',            -- start (timestamp with time zone NOT NULL)
    '2021-03-04 11:20:05.171441+00',            -- end (timestamp with time zone NOT NULL) -- von Hand ergänzt
    250,                                        -- volumePerPeriod (bigint NOT NULL)
    '1',                                       	-- periodTimeFrame (character varying NOT NULL) -- von Hand ergänzt
    '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', -- product (json NOT NULL)
    '3'                                         -- status (character varying NOT NULL) -- von Hand ergänzt
);


CREATE TABLE IF NOT EXISTS public."exchange_order" (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    "startVolume" bigint NOT NULL,
    "currentVolume" bigint NOT NULL,
    price integer NOT NULL, -- Preis pro MWh in US-ct
    type integer DEFAULT 0 NOT NULL,
    "directBuyId" uuid,
    "validFrom" timestamp with time zone NOT NULL,
    product json NOT NULL,
    "assetId" uuid,
    "demandId" uuid,
    "status" character varying NOT NULL,
    "side" character varying NOT NULL
);

INSERT INTO public."exchange_order" ("userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") 
VALUES (
    '7',                                        -- userId (character varying NOT NULL)
    'Active',                                   -- status (character varying NOT NULL)
    500,                                        -- startVolume (bigint NOT NULL)
    250,                                        -- currentVolume (bigint NOT NULL)
    'Ask',                                        -- side (character varying NOT NULL)
    1000,                                       -- price (integer NOT NULL)
    '2021-03-04 11:20:05.648397+00',            -- validFrom (timestamp with time zone NOT NULL)
    '{"deviceType":["Solar;Photovoltaic;Roof mounted"],"location":["Thailand;South;Phuket"],"generationFrom":"2021-01-01T00:00:00.000Z","generationTo":"2021-01-31T00:00:00.000Z"}',  -- product (json NOT NULL)
    NULL,                                       -- assetId (uuid)
    NULL                                        -- demandId (uuid)
);

INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('d91d2450-ec5c-4819-9237-6582b6858ef4', '1', 'Active', 250, 0, 'Ask', 1000, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, '87406dfd-1757-4ef9-ab28-c89ab8dadf90');

INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('ed4649f2-20f8-4589-a8be-296d4fe38d9c', '1', 'Active', 2500000, 2500000, 'Bid', 900, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('47527400-26be-4830-aaa7-307e9a889b4e', '1', 'Active', 2500000, 2500000, 'Bid', 850, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('6ec0593e-7810-4164-96a6-954b2e441172', '1', 'Active', 2500000, 2500000, 'Bid', 750, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, NULL);


INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('d34ca8db-fa66-47fa-9d3f-6d9d278c03b2', '2', 'Active', 5000000, 5000000, 'Ask', 1100, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016},"generationFrom":"2020-01-01T00:00:00.000Z","generationTo":"2020-01-31T00:00:00.000Z"}', 'e7ce7521-aea0-49a0-bed3-deb7db357cd2', NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('a15e2d4c-f9d8-432e-8635-21b6c9aadcdf', '2', 'Active', 5000000, 5000000, 'Ask', 1200, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016},"generationFrom":"2020-01-01T00:00:00.000Z","generationTo":"2020-01-31T00:00:00.000Z"}', 'e7ce7521-aea0-49a0-bed3-deb7db357cd2', NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('b2a8a14c-ddf7-45cf-bc4e-108ba19d11eb', '2', 'Active', 15000000, 15000000, 'Ask', 1300, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016},"generationFrom":"2020-01-01T00:00:00.000Z","generationTo":"2020-01-31T00:00:00.000Z"}', 'e7ce7521-aea0-49a0-bed3-deb7db357cd2', NULL);

INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('3016eaee-e93e-4356-a5c9-f45f228642f5', '2', 'Active', 3000000, 3000000, 'Ask', 800, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Wind;Onshore"],"location":["Thailand;Northeast;Nakhon Ratchasima"],"deviceVintage":{"year":2014},"generationFrom":"2020-01-01T00:00:00.000Z","generationTo":"2020-01-31T00:00:00.000Z"}', '2c0fd5e0-a819-4d6a-bfde-e24343d9d679', NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('2ead1352-cff0-41b7-b5ba-841e8de07d0f', '2', 'Active', 4000000, 4000000, 'Ask', 850, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Wind;Onshore"],"location":["Thailand;Northeast;Nakhon Ratchasima"],"deviceVintage":{"year":2014},"generationFrom":"2020-01-01T00:00:00.000Z","generationTo":"2020-01-31T00:00:00.000Z"}', '2c0fd5e0-a819-4d6a-bfde-e24343d9d679', NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('b3da36a4-9562-466d-aa6e-9cf0aed8a336', '2', 'Active', 5000000, 5000000, 'Ask', 860, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Wind;Onshore"],"location":["Thailand;Northeast;Nakhon Ratchasima"],"deviceVintage":{"year":2014},"generationFrom":"2020-01-01T00:00:00.000Z","generationTo":"2020-01-31T00:00:00.000Z"}', '2c0fd5e0-a819-4d6a-bfde-e24343d9d679', NULL);

INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('d6d8be53-4d50-4a71-9554-609a10bf2a73', '2', 'Active', 5000000, 5000000, 'Bid', 790, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Wind"],"location":["Thailand;Northeast"]}', NULL, NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('dda5f595-b0f6-4f9b-b186-f04c86d71ce5', '2', 'Active', 5000000, 5000000, 'Bid', 780, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Wind"],"location":["Thailand;Northeast"]}', NULL, NULL);
INSERT INTO public."exchange_order" (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('fa041c7a-2a1f-4241-b158-cb6d3ad1789b', '2', 'Active', 5000000, 5000000, 'Bid', 770, '2021-03-04 11:20:05.648397+00', '{"deviceType":["Wind"],"location":["Thailand;Northeast"]}', NULL, NULL);


CREATE TABLE IF NOT EXISTS public.exchange_trade (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created timestamp with time zone NOT NULL,
    volume bigint NOT NULL,
    price integer NOT NULL,
    "bidId" uuid,
    "askId" uuid
);

INSERT INTO public.exchange_trade (id, created, volume, price, "bidId", "askId") VALUES ('6bd15adf-f1ce-4003-b38e-9a560a2c5e2e', '2020-03-04 11:20:05.628+00', 250, 1000, 'd91d2450-ec5c-4819-9237-6582b6858ef4', 'c6463d76-bd4e-4015-beef-0834c7fb682a');

CREATE TABLE IF NOT EXISTS public.exchange_transfer (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    amount bigint NOT NULL,
    "transactionHash" character varying,
    address character varying NOT NULL,
    status integer NOT NULL,
    "confirmationBlock" integer,
    direction integer NOT NULL,
    "assetId" uuid
);

INSERT INTO public.exchange_transfer (id, "userId", amount, "transactionHash", address, status, "confirmationBlock", direction, "assetId") VALUES ('7877df6a-79f0-4599-b92a-673754d1e6a2', '2', 100000000, '0x4a84a', '0x4dc3c0838CB50dbA753f3aE583a61655019c40e1', 3, 10000, 0, 'e7ce7521-aea0-49a0-bed3-deb7db357cd2');
INSERT INTO public.exchange_transfer (id, "userId", amount, "transactionHash", address, status, "confirmationBlock", direction, "assetId") VALUES ('a07ca8f6-a061-4887-9e54-3bf9036ae864', '2', 100000000, '0x4a84b', '0x4dc3c0838CB50dbA753f3aE583a61655019c40e1', 3, 10000, 0, '2c0fd5e0-a819-4d6a-bfde-e24343d9d679');














/*

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
*/
/*
 ORGANIZATION BloGPV
 */

INSERT INTO public."platform_organization" (
        "createdAt",
        "updatedAt",
        id,         
        name,
        address,
        city,
        "zipCode",
        country,
        "businessType",
        "tradeRegistryCompanyNumber",
        "vatNumber",
        "signatoryFullName",
        "signatoryAddress",
        "signatoryCity",
        "signatoryZipCode",
        "signatoryCountry",
        "signatoryEmail",
        "signatoryPhoneNumber",
        status,
        "documentIds",
        "signatoryDocumentIds"
    )
VALUES (
        '2021-03-17 15:51:54.56814+00',
        '2021-03-17 15:51:54.56814+00',    
        7,                                  -- darf noch nicht vorhanden sein
        'BloGPV',
        'Blogpv street 1234',
        'Berlin',
        '12345',
        'DE',
        '3',
        '0123456789',
        '0123456789',
        'BloGPV BloGPV',
        'Blogpv street 1234',
        'Berlin',
        '12345',
        'DE',
        'blogpv@gmail.com',
        '0123456789',
        'Active',
        'fcec98e2-6c40-4b8f-ae04-c64aaefffdf4',
        '9f76166e-d882-4c2e-8aec-1cd6f547a897,01e7f0e6-47b4-4f6f-b4de-8c392889996a'
    );

/*
 USERS
 */
-- organization owner

INSERT INTO public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES (
        '2021-03-17 14:43:31.953782+00',
        '2021-03-17 14:43:31.953782+00',
        8,                                  
        'Dr',
        'BloGPV',
        'BloGPV',
        'blogpv@gmail.com',
        '0123456789',
        '$2a$08$mw1oTmVsH2OPGJEFUN.04OaqdP6g1U8rMOK7paeKQRi3mveGnO9S2',
        '0xf3fea0f73f4a7b2608ef9b4803e8bea6fd79e694',
        '0xddb57a81f2d0b2c7716277eb69055e655d99f18d086b20a9108861c57a36e7f56d19f619a05762fa0f195af726997130e6554a77a21eae6209f439448c5ee19e1c',
        'true',
        '1',
        '7',
        'Active',
        'Passed'
);

INSERT INTO public.exchange_account (id, "userId", address) VALUES ('2bfc9f5c-36b5-4730-9b19-edb09e6642f0', '7', '0x24B207fFf1a1097d3c3D69fcE461544f83c6E774');

/*
UPDATE public.device
SET "organizationId" = '7'
WHERE "organizationId" = '3';
*/








/*
INSERT INTO public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        2,
        'Mr',
        'Device',
        'Manager',
        'devicemanager@mailinator.com',
        '111-111-111',
        '$2a$08$kBdGu/H3pAHzGupU2qB0NeHIBtRVCOFpLXkQay.LxnjGVm2oFxUSK',
        '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
        '0xe6f70568571f331ae431bb4d3249aaf4a01c548ddd6e0a1fbefdd207cf31b13d419f43ff28cf011df17697eb7856c470e361b4239898f53613cacbcc589e5d6a1c',
        't',
        '1',
        '2',
        'Active',
        'Passed'
    );
INSERT INTO public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        3,
        'Mr',
        'Device',
        'Manager 2',
        'devicemanager2@mailinator.com',
        '111-111-111',
        '$2a$08$hxfSpn5Y7mZ9MjmcV5QdZemmi3aST8U2RFmod4bjpTZbWcwxAFgaO',
        '0xfd863c662307fcf0c15f0b9f74f1d06544f19908',
        '0x617ba0b0b20d547272001e2b1d9a9ef7da24b5e58c2a97767fb2e65a294010906862458c503dbe1a6db0db782cddf9bd98409bdaa0930754b3bd18863c8d99ab1b',
        't',
        '1',
        '3',
        'Active',
        'Passed'
    );
INSERT INTO public."user" (
        "createdAt",
        "updatedAt",
        id,
        title,
        "firstName",
        "lastName",
        email,
        telephone,
        password,
        "blockchainAccountAddress",
        "blockchainAccountSignedMessage",
        notifications,
        rights,
        "organizationId",
        status,
        "kycStatus"
    )
VALUES (
        '2020-03-30 10:08:33.510625+02',
        '2020-03-30 10:08:33.652639+02',
        4,
        'Mr',
        'Trader',
        'Surname',
        'trader@mailinator.com',
        '111-111-111',
        '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6',
        '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
        '0xb0a804f410f2934278703eb992e5ba12f9e8b9068b68ff6d1246a56cf52e48677d3648057453d86f4372b2ffd98fa189aee1562d8c564ac62bc416d6cdc474051c',
        'f',
        '1',
        '4',
        'Active',
        'Passed'
    );
INSERT INTO "public"."user"(
        "createdAt",
        "updatedAt",
        "id",
        "title",
        "firstName",
        "lastName",
        "email",
        "telephone",
        "password",
        "notifications",
        "rights",
        "organizationId",
        "status",
        "kycStatus"
    )
VALUES (
        '2020-03-30 08:08:33.510625+00',
        '2020-03-30 08:08:33.652639+00',
        5,
        'Mr',
        'Admin',
        'Surname',
        'admin@mailinator.com',
        '111-111-111',
        '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6',
        'f',
        '16',
        5,
        'Active',
        'Passed'
    );
INSERT INTO "public"."user"(
        "createdAt",
        "updatedAt",
        "id",
        "title",
        "firstName",
        "lastName",
        "email",
        "telephone",
        "password",
        "notifications",
        "rights",
        "organizationId",
        "status",
        "kycStatus"
    )
VALUES (
        '2020-03-30 08:08:33.510625+00',
        '2020-03-30 08:08:33.652639+00',
        6,
        'Mr',
        'Agents',
        'Surname',
        'agents@mailinator.com',
        '111-111-111',
        '$2a$08$j8LnGtFdbTfKN5F.0InfdO2gxMWXHbrjWvRziCIl0lRj.kxOKJ/b6',
        'f',
        '32',
        5,
        'Active',
        'Passed'
    );
INSERT INTO public.device (
        "createdAt",
        "updatedAt",
        id,
        status,
        "facilityName",
        "description",
        images,
        address,
        region,
        province,
        country,
        "operationalSince",
        "capacityInW",
        "gpsLatitude",
        "gpsLongitude",
        timezone,
        "deviceType",
        "complianceRegistry",
        "otherGreenAttributes",
        "typeOfPublicSupport",
        "deviceGroup",
        "smartMeterReads",
        "externalDeviceIds",
        "organizationId",
        "gridOperator"
    )
VALUES (
        '2020-03-30 09:36:02.607206+02',
        '2020-03-30 09:36:02.607206+02',
        1,
        'Active',
        'Wuthering Heights Windfarm',
        '',
        '',
        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        'Central',
        'Nakhon Pathom',
        'Thailand',
        '1514764800',
        '10000',
        '14.059500',
        '99.977800',
        'Asia/Bangkok',
        'Wind;Onshore',
        'I-REC',
        'N.A.',
        'N.A.',
        '',
        '[]',
        '[{"id":123,"type":"Smart Meter Readings API ID"},{"id":"ABQ123-1","type":"Issuer ID"}]',
        '2',
        'TH-PEA'
    );
INSERT INTO public.device (
        "createdAt",
        "updatedAt",
        id,
        status,
        "facilityName",
        "description",
        images,
        address,
        region,
        province,
        country,
        "operationalSince",
        "capacityInW",
        "gpsLatitude",
        "gpsLongitude",
        timezone,
        "deviceType",
        "complianceRegistry",
        "otherGreenAttributes",
        "typeOfPublicSupport",
        "deviceGroup",
        "smartMeterReads",
        "externalDeviceIds",
        "organizationId",
        "gridOperator"
    )
VALUES (
        '2020-03-30 09:36:02.607206+02',
        '2020-03-30 09:36:02.607206+02',
        2,
        'Active',
        'Solar Facility A',
        '',
        '',
        'Phuket',
        'South',
        'Phuket',
        'Thailand',
        '1483228800',
        '70000',
        '15.1739',
        '101.4928',
        'Asia/Bangkok',
        'Solar;Photovoltaic;Roof mounted',
        'I-REC',
        'N.A.',
        'N.A.',
        '',
        '[]',
        '[{"id":"ABQ123-2","type":"Issuer ID"}]',
        '3',
        'TH-MEA'
    );
INSERT INTO public.device (
        "createdAt",
        "updatedAt",
        id,
        status,
        "facilityName",
        "description",
        images,
        address,
        region,
        province,
        country,
        "operationalSince",
        "capacityInW",
        "gpsLatitude",
        "gpsLongitude",
        timezone,
        "deviceType",
        "complianceRegistry",
        "otherGreenAttributes",
        "typeOfPublicSupport",
        "deviceGroup",
        "smartMeterReads",
        "externalDeviceIds",
        "organizationId",
        "gridOperator"
    )
VALUES (
        '2020-03-30 09:36:02.607206+02',
        '2020-03-30 09:36:02.607206+02',
        3,
        'Active',
        'Biomass Facility',
        '',
        '',
        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        'Central',
        'Nakhon Pathom',
        'Thailand',
        '1514764800',
        '10000',
        '14.059500',
        '99.977800',
        'Asia/Bangkok',
        'Solid;Biomass from agriculture;Agricultural products',
        'I-REC',
        'N.A.',
        'N.A.',
        '',
        '[]',
        '[{"id":"ABQ123-3","type":"Issuer ID"}]',
        '2',
        'TH-PEA'
    );
SELECT setval(
        pg_get_serial_sequence('public.user', 'id'),
        (
            SELECT MAX("id")
            FROM public.user
        ) + 1
    );
SELECT setval(
        pg_get_serial_sequence('public.platform_organization', 'id'),
        (
            SELECT MAX("id")
            FROM public.platform_organization
        ) + 1
    );
SELECT setval(
        pg_get_serial_sequence('public.device', 'id'),
        (
            SELECT MAX("id")
            FROM public.device
        ) + 1
    );
*/
/*
 DEVICE REGISTRIES
 */
-- INSERT INTO public."irec_device_registry_device" (
--         "createdAt",
--         "updatedAt",
--         "id",
--         "ownerId",
--         "code",
--         "name",
--         "defaultAccount",
--         "deviceType",
--         "fuel",
--         "countryCode",
--         "registrantOrganization",
--         "issuer",
--         "capacity",
--         "commissioningDate",
--         "registrationDate",
--         "address",
--         "latitude",
--         "longitude",
--         "notes",
--         "status",
--         "timezone",
--         "gridOperator"
--     )
-- VALUES (
--         '2020-03-30 09:36:02.607206+02',
--         '2020-03-30 09:36:02.607206+02',
--         '0e01b315-4f80-4d65-ab9d-84232769ef9d',
--         '1',
--         'TESTDEVICE001',
--         'Wuthering Heights Windfarm',
--         'ORG001TRADE001',
--         'TC210',
--         'ES200',
--         'TH',
--         'ORG001',
--         'ISSER001',
--         '10000',
--         '2020-01-01T00:00:00.000Z',
--         '2020-01-02T00:00:00.000Z',
--         '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
--         '14.059500',
--         '99.977800',
--         'Notes...',
--         'Active',
--         'Asia/Bangkok',
--         'TH-PEA'
--     );
-- INSERT INTO public."device_registry_device" (
--         "createdAt",
--         "updatedAt",
--         "id",
--         "owner",
--         "externalRegistryId",
--         "smartMeterId",
--         "description"
--     )
-- VALUES (
--         '2020-03-30 09:36:02.607206+02',
--         '2020-03-30 09:36:02.607206+02',
--         'be2df88a-90c2-4dad-9de4-8ef423a7d3f0',
--         '1',
--         '0e01b315-4f80-4d65-ab9d-84232769ef9d',
--         'METER001',
--         'Wuthering Heights Windfarm description'
--     );
-- INSERT INTO public."irec_device_registry_device" (
--         "createdAt",
--         "updatedAt",
--         "id",
--         "ownerId",
--         "code",
--         "name",
--         "defaultAccount",
--         "deviceType",
--         "fuel",
--         "countryCode",
--         "registrantOrganization",
--         "issuer",
--         "capacity",
--         "commissioningDate",
--         "registrationDate",
--         "address",
--         "latitude",
--         "longitude",
--         "notes",
--         "status",
--         "timezone",
--         "gridOperator"
--     )
-- VALUES (
--         '2020-03-30 09:36:02.607206+02',
--         '2020-03-30 09:36:02.607206+02',
--         'd242c965-81a0-4917-afa1-f5217937afd6',
--         '2',
--         'TESTDEVICE002',
--         'Solar Facility A',
--         'ORG002TRADE001',
--         'TC140',
--         'ES100',
--         'TH',
--         'ORG002',
--         'ISSER001',
--         '70000',
--         '2020-01-01T00:00:00.000Z',
--         '2020-01-02T00:00:00.000Z',
--         '1 Wind Farm Avenue, Thailand',
--         '15.1739',
--         '101.4928',
--         'Notes...',
--         'Active',
--         'Asia/Bangkok',
--         'TH-MEA'
--     );
-- INSERT INTO public."device_registry_device" (
--         "createdAt",
--         "updatedAt",
--         "id",
--         "owner",
--         "externalRegistryId",
--         "smartMeterId",
--         "description"
--     )
-- VALUES (
--         '2020-03-30 09:36:02.607206+02',
--         '2020-03-30 09:36:02.607206+02',
--         '5c9c6eb4-af2c-4336-8aae-1d579194bb4f',
--         '2',
--         'd242c965-81a0-4917-afa1-f5217937afd6',
--         'METER002',
--         'Solar Facility A description'
--     );
-- INSERT INTO public."irec_device_registry_device" (
--         "createdAt",
--         "updatedAt",
--         "id",
--         "ownerId",
--         "code",
--         "name",
--         "defaultAccount",
--         "deviceType",
--         "fuel",
--         "countryCode",
--         "registrantOrganization",
--         "issuer",
--         "capacity",
--         "commissioningDate",
--         "registrationDate",
--         "address",
--         "latitude",
--         "longitude",
--         "notes",
--         "status",
--         "timezone",
--         "gridOperator"
--     )
-- VALUES (
--         '2020-03-30 09:36:02.607206+02',
--         '2020-03-30 09:36:02.607206+02',
--         'd49f7fed-2f79-4d10-8985-41a0c3e9ba03',
--         '3',
--         'TESTDEVICE003',
--         'Biomass Facility',
--         'ORG003TRADE001',
--         'TC140',
--         'ES560',
--         'TH',
--         'ORG003',
--         'ISSER001',
--         '10000',
--         '2020-01-01T00:00:00.000Z',
--         '2020-01-02T00:00:00.000Z',
--         '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
--         '14.059500',
--         '99.977800',
--         'Notes...',
--         'Active',
--         'Asia/Bangkok',
--         'TH-PEA'
--     );
-- INSERT INTO public."device_registry_device" (
--         "createdAt",
--         "updatedAt",
--         "id",
--         "owner",
--         "externalRegistryId",
--         "smartMeterId",
--         "description"
--     )
-- VALUES (
--         '2020-03-30 09:36:02.607206+02',
--         '2020-03-30 09:36:02.607206+02',
--         '7f8fa2f6-d95a-4237-8e53-d9876318e077',
--         '3',
--         'd49f7fed-2f79-4d10-8985-41a0c3e9ba03',
--         'METER003',
--         'Biomass Facility description'
--     );













-- UPDATE public.email_confirmation SET confirmed = true WHERE id = 1;
-- UPDATE public.platform_organization SET status = 'Active';
-- UPDATE public.user SET status = 'Active';
-- UPDATE public.user SET "kycStatus" = 'Passed';
-- UPDATE public."exchange_order" SET status = 'Active';
-- (id, "userId", status, "startVolume", "currentVolume", side, price, "validFrom", product, "assetId", "demandId") VALUES ('d91d2450-ec5c-4819-9237-6582b6858ef4', '1', 'Active', 250, 0, 'Ask', 1000, '2020-03-04 11:20:05.648397+00', '{"deviceType":["Solar;Photovoltaic;Classic silicon"],"location":["Thailand;Central;Nakhon Pathom"],"deviceVintage":{"year":2016}}', NULL, '87406dfd-1757-4ef9-ab28-c89ab8dadf90');


/*
ALTER TABLE ONLY public."exchange_order"
    ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY (id);

ALTER TABLE ONLY public.exchange_asset
    ADD CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY (id);

ALTER TABLE ONLY public.exchange_demand
    ADD CONSTRAINT "PK_2e27cd7b3d79c50d197cb0b3924" PRIMARY KEY (id);

ALTER TABLE ONLY public.exchange_account
    ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY (id);

ALTER TABLE ONLY public.exchange_trade
    ADD CONSTRAINT "PK_d4097908741dc408f8274ebdc53" PRIMARY KEY (id);

ALTER TABLE ONLY public.exchange_transfer
    ADD CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY (id);

ALTER TABLE ONLY public."exchange_order"
    ADD CONSTRAINT "FK_7f2d092dc1c3229755959c49b45" FOREIGN KEY ("demandId") REFERENCES public.demand(id);

ALTER TABLE ONLY public."exchange_order"
    ADD CONSTRAINT "FK_8b2e2e46cf8773a56a0fd512856" FOREIGN KEY ("assetId") REFERENCES public.asset(id);

ALTER TABLE ONLY public.exchange_trade
    ADD CONSTRAINT "FK_9cb1744cacf77d85709606bb70e" FOREIGN KEY ("askId") REFERENCES public."order"(id);

ALTER TABLE ONLY public.exchange_trade
    ADD CONSTRAINT "FK_b71911724b2024af5ac4e8fc5bf" FOREIGN KEY ("bidId") REFERENCES public."order"(id);

ALTER TABLE ONLY public.exchange_transfer
    ADD CONSTRAINT "FK_ec4244fc73c558c2eae38ba8ea6" FOREIGN KEY ("assetId") REFERENCES public.asset(id);
*/	
	