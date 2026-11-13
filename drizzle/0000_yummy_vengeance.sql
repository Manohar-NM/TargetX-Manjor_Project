CREATE TABLE `grnaCandidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`guideName` varchar(64) NOT NULL,
	`guideSequence` varchar(20) NOT NULL,
	`pamSequence` varchar(3) NOT NULL DEFAULT 'NGG',
	`chromosome` varchar(8),
	`startPosition` int,
	`endPosition` int,
	`strand` varchar(1) DEFAULT '+',
	`gcContent` double NOT NULL,
	`position1A` double DEFAULT 0,
	`position1G` double DEFAULT 0,
	`position1T` double DEFAULT 0,
	`position1C` double DEFAULT 0,
	`position2A` double DEFAULT 0,
	`position2G` double DEFAULT 0,
	`position2T` double DEFAULT 0,
	`position2C` double DEFAULT 0,
	`gcContentSkew` double DEFAULT 0,
	`firstNucleotideA` double DEFAULT 0,
	`firstNucleotideT` double DEFAULT 0,
	`firstNucleotideG` double DEFAULT 0,
	`firstNucleotideC` double DEFAULT 0,
	`dinucleotideAA` double DEFAULT 0,
	`dinucleotideTT` double DEFAULT 0,
	`dinucleotideGG` double DEFAULT 0,
	`dinucleotideCC` double DEFAULT 0,
	`dinucleotideAT` double DEFAULT 0,
	`dinucleotideGC` double DEFAULT 0,
	`trimerGC` double DEFAULT 0,
	`trimerAA` double DEFAULT 0,
	`trimerGG` double DEFAULT 0,
	`trimerTT` double DEFAULT 0,
	`selfComplementarity` double DEFAULT 0,
	`tm` double DEFAULT 0,
	`homopolymerRunMax` int DEFAULT 0,
	`pamDistance` int DEFAULT 0,
	`xgboostScore` double DEFAULT 0,
	`lightgbmScore` double DEFAULT 0,
	`randomForestScore` double,
	`ensembleScore` double DEFAULT 0,
	`finalRank` int DEFAULT 0,
	`confidence` enum('high','medium','low') DEFAULT 'medium',
	`totalOfftargetSites` int DEFAULT 0,
	`offTargetRisk` enum('low','medium','high','unassessed') DEFAULT 'unassessed',
	`seedMismatchCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grnaCandidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offTargetSites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`projectId` int NOT NULL,
	`chromosome` varchar(8) NOT NULL,
	`position` int NOT NULL,
	`strand` varchar(1) DEFAULT '+',
	`mismatchCount` int NOT NULL,
	`mismatchPositions` json,
	`pamSequence` varchar(3),
	`cleavageProbability` double DEFAULT 0,
	`severity` enum('safe','caution','risk','critical') DEFAULT 'safe',
	`genomicContext` varchar(128),
	`isInCodingRegion` int DEFAULT 0,
	CONSTRAINT `offTargetSites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelineStages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`stageName` enum('ai_understanding','gene_id','pam_detection','grna_generation','efficiency','offtarget','explainability','ranking','report') NOT NULL,
	`status` enum('pending','running','complete','error') NOT NULL DEFAULT 'pending',
	`stageOrder` int NOT NULL,
	`inputSummary` text,
	`outputSummary` text,
	`outputData` json,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`error` text,
	CONSTRAINT `pipelineStages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`organism` varchar(128) NOT NULL,
	`genome` varchar(64) NOT NULL DEFAULT 'hg38',
	`pamType` varchar(16) NOT NULL DEFAULT 'NGG',
	`inputMode` enum('nlp','gene','sequence') NOT NULL DEFAULT 'nlp',
	`inputText` text NOT NULL,
	`targetGene` varchar(64),
	`targetSequence` text,
	`status` enum('draft','running','complete','error') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`reportTitle` varchar(256) NOT NULL,
	`executiveSummary` text,
	`methodology` text,
	`results` json,
	`topCandidates` json,
	`recommendations` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shapResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`projectId` int NOT NULL,
	`featureName` varchar(64) NOT NULL,
	`shapValue` double NOT NULL,
	`featureValue` double DEFAULT 0,
	`contribution` double DEFAULT 0,
	`direction` enum('positive','negative') DEFAULT 'positive',
	CONSTRAINT `shapResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
