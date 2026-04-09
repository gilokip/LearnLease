-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2026 at 04:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unilease`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 8, 'LEASE_APPLIED', 'lease', 1, '{\"deviceId\":6,\"planType\":\"semester\",\"weeks\":16}', NULL, '2026-03-31 14:30:09'),
(2, 5, 'LEASE_APPROVED', 'lease', 1, '{\"studentId\":\"INTE/N/0189/14/23\",\"deviceId\":6}', NULL, '2026-03-31 14:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(200) NOT NULL,
  `serial_number` varchar(100) NOT NULL,
  `specs` text DEFAULT NULL,
  `monthly_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `campus_location` varchar(100) DEFAULT NULL,
  `status` enum('available','leased','maintenance','decommissioned') DEFAULT 'available',
  `condition_notes` text DEFAULT NULL,
  `purchased_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`id`, `brand`, `model`, `serial_number`, `specs`, `monthly_rate`, `campus_location`, `status`, `condition_notes`, `purchased_date`, `created_at`, `updated_at`) VALUES
(1, 'Apple', 'MacBook Pro 14\" M3', 'MBP-2024-001', 'M3 8-core, 16GB RAM, 512GB SSD', 50.00, 'Center A', 'available', NULL, NULL, '2026-03-02 06:22:10', NULL),
(2, 'Dell', 'XPS 15 9530', 'DXP-2024-001', 'i7-13700H, 16GB RAM, 512GB SSD', 40.00, 'Center A', 'available', NULL, NULL, '2026-03-02 06:22:10', NULL),
(3, 'Lenovo', 'ThinkPad X1 Carbon', 'TPX-2024-001', 'i5-1335U, 16GB RAM, 256GB SSD', 38.00, 'Center B', 'available', NULL, NULL, '2026-03-02 06:22:10', NULL),
(4, 'HP', 'EliteBook 840 G10', 'HPE-2024-001', 'i5-1335U, 8GB RAM, 256GB SSD', 35.00, 'Center B', 'available', NULL, NULL, '2026-03-02 06:22:10', NULL),
(5, 'Microsoft', 'Surface Pro 10', 'MSP-2024-001', 'i7-1265U, 16GB RAM, 256GB SSD', 45.00, 'Center C', 'available', NULL, NULL, '2026-03-02 06:22:10', NULL),
(6, 'ASUS', 'ZenBook 14 OLED', 'AZB-2024-001', 'Ryzen 7, 16GB RAM, 512GB SSD', 30.00, 'Center C', 'leased', NULL, NULL, '2026-03-02 06:22:10', '2026-03-31 14:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `leases`
--

CREATE TABLE `leases` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `plan_type` enum('semester','annual','monthly') NOT NULL DEFAULT 'semester',
  `duration_weeks` int(11) DEFAULT 16,
  `status` enum('pending','approved','active','returned','rejected','expired') DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `rejection_note` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leases`
--

INSERT INTO `leases` (`id`, `student_id`, `device_id`, `plan_type`, `duration_weeks`, `status`, `start_date`, `end_date`, `approved_by`, `rejection_note`, `created_at`, `updated_at`) VALUES
(1, 8, 6, 'semester', 16, 'active', '2026-03-31', '2026-07-21', 5, NULL, '2026-03-31 14:30:09', '2026-03-31 14:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_logs`
--

CREATE TABLE `maintenance_logs` (
  `id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `reported_by` int(11) NOT NULL,
  `issue` text NOT NULL,
  `resolution` text DEFAULT NULL,
  `status` enum('reported','in_progress','resolved') DEFAULT 'reported',
  `cost` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `lease_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('pending','paid','overdue','waived') DEFAULT 'pending',
  `payment_ref` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `lease_id`, `amount`, `due_date`, `paid_date`, `status`, `payment_ref`, `notes`, `created_at`) VALUES
(1, 1, 30.00, '2026-05-01', NULL, 'pending', NULL, NULL, '2026-03-31 14:31:03'),
(2, 1, 30.00, '2026-05-31', NULL, 'pending', NULL, NULL, '2026-03-31 14:31:03'),
(3, 1, 30.00, '2026-07-01', NULL, 'pending', NULL, NULL, '2026-03-31 14:31:03'),
(4, 1, 30.00, '2026-07-31', NULL, 'pending', NULL, NULL, '2026-03-31 14:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lease_id` int(11) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `assigned_to` int(11) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('student','admin','inventory','finance') NOT NULL DEFAULT 'student',
  `student_id` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `student_id`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 'gilokip@gmail.com', '$2b$12$EEpdnp74QK.et3v0PaVn5urld.9h6O8Km9cjoDS.cFmTVoQDSH1sq', 'Gilbert', 'admin', NULL, 1, '2026-03-02 07:00:02', NULL),
(6, 'test@gmail.com', '$2b$12$YKECaun23s29woesEjBhXuyeg9zVWiL4cRu4iFKbJi19ROdfc.6jW', 'Gilbert', 'inventory', NULL, 1, '2026-03-02 07:14:07', NULL),
(7, 'jessekips@gmail.com', '$2b$12$cvP2b.kWY6l8jt85mjyhSuya/C0FT6Pqplq99B4thKVuU/yWx4AH6', 'Jesse Kiprono', 'inventory', NULL, 1, '2026-03-31 14:07:02', NULL),
(8, 'tonykips@gmail.com', '$2b$12$bX47excuwi7k1JNTubgU2eRUrrgBd0.CAGRPCUjB3WySMSjSr9pxG', 'Tony Kiplagat', 'student', 'INTE/N/0189/14/23', 1, '2026-03-31 14:09:43', NULL),
(9, 'collokim@gmail.com', '$2b$12$53mpI6tkKYFW4xTnYdCF9uUu9ESmt1SJ7VVlpFK34xYfUZ69qc2.G', 'Collins Kimemia', 'finance', NULL, 1, '2026-03-31 14:56:56', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_number` (`serial_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_serial` (`serial_number`);

--
-- Indexes for table `leases`
--
ALTER TABLE `leases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_device` (`device_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`),
  ADD KEY `reported_by` (`reported_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lease` (`lease_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due` (`due_date`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `lease_id` (`lease_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `leases`
--
ALTER TABLE `leases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `leases`
--
ALTER TABLE `leases`
  ADD CONSTRAINT `leases_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leases_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  ADD CONSTRAINT `leases_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD CONSTRAINT `maintenance_logs_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_logs_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `support_tickets_ibfk_2` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_tickets_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
