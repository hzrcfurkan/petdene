import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...")
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.vaccination.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.petService.deleteMany()
  await prisma.pet.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // Hash password for users
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create Users
  console.log("👥 Creating users...")
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@petcare.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      phone: "+1234567890",
      emailVerified: new Date(),
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@petcare.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "+1234567891",
      emailVerified: new Date(),
    },
  })

  const vet1 = await prisma.user.create({
    data: {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@petcare.com",
      password: hashedPassword,
      role: "STAFF",
      phone: "+1234567892",
      emailVerified: new Date(),
    },
  })

  const vet2 = await prisma.user.create({
    data: {
      name: "Dr. Michael Chen",
      email: "michael.chen@petcare.com",
      password: hashedPassword,
      role: "STAFF",
      phone: "+1234567893",
      emailVerified: new Date(),
    },
  })

  const groomer = await prisma.user.create({
    data: {
      name: "Emma Wilson",
      email: "emma.wilson@petcare.com",
      password: hashedPassword,
      role: "STAFF",
      phone: "+1234567894",
      emailVerified: new Date(),
    },
  })

  const customer1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: hashedPassword,
      role: "CUSTOMER",
      phone: "+1234567895",
      emailVerified: new Date(),
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: hashedPassword,
      role: "CUSTOMER",
      phone: "+1234567896",
      emailVerified: new Date(),
    },
  })

  const customer3 = await prisma.user.create({
    data: {
      name: "Robert Brown",
      email: "robert.brown@example.com",
      password: hashedPassword,
      role: "CUSTOMER",
      phone: "+1234567897",
      emailVerified: new Date(),
    },
  })

  // Create Pets
  console.log("🐾 Creating pets...")
  const pet1 = await prisma.pet.create({
    data: {
      ownerId: customer1.id,
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      gender: "Male",
      age: 3,
      dateOfBirth: new Date("2021-05-15"),
      weight: 30.5,
      color: "Golden",
      notes: "Friendly and energetic. Loves playing fetch.",
    },
  })

  const pet2 = await prisma.pet.create({
    data: {
      ownerId: customer1.id,
      name: "Luna",
      species: "Cat",
      breed: "Persian",
      gender: "Female",
      age: 2,
      dateOfBirth: new Date("2022-08-20"),
      weight: 4.2,
      color: "White",
      notes: "Calm and affectionate. Prefers indoor activities.",
    },
  })

  const pet3 = await prisma.pet.create({
    data: {
      ownerId: customer2.id,
      name: "Max",
      species: "Dog",
      breed: "German Shepherd",
      gender: "Male",
      age: 5,
      dateOfBirth: new Date("2019-03-10"),
      weight: 35.0,
      color: "Black and Tan",
      notes: "Very protective. Needs regular exercise.",
    },
  })

  const pet4 = await prisma.pet.create({
    data: {
      ownerId: customer2.id,
      name: "Whiskers",
      species: "Cat",
      breed: "Siamese",
      gender: "Male",
      age: 1,
      dateOfBirth: new Date("2023-11-05"),
      weight: 3.8,
      color: "Cream and Brown",
      notes: "Playful kitten. Very social.",
    },
  })

  const pet5 = await prisma.pet.create({
    data: {
      ownerId: customer3.id,
      name: "Charlie",
      species: "Dog",
      breed: "Labrador",
      gender: "Male",
      age: 4,
      dateOfBirth: new Date("2020-07-12"),
      weight: 28.0,
      color: "Chocolate",
      notes: "Loves water and swimming. Very obedient.",
    },
  })

  const pet6 = await prisma.pet.create({
    data: {
      ownerId: customer3.id,
      name: "Milo",
      species: "Bird",
      breed: "Parrot",
      gender: "Male",
      age: 2,
      dateOfBirth: new Date("2022-09-18"),
      weight: 0.5,
      color: "Green and Yellow",
      notes: "Can speak a few words. Very intelligent.",
    },
  })

  // Create Pet Services
  console.log("🛎️ Creating pet services...")
  const service1 = await prisma.petService.create({
    data: {
      title: "Basic Grooming",
      type: "grooming",
      description: "Bath, brush, nail trim, and ear cleaning",
      duration: 60,
      price: 50.0,
      active: true,
    },
  })

  const service2 = await prisma.petService.create({
    data: {
      title: "Full Grooming",
      type: "grooming",
      description: "Complete grooming package including haircut, bath, and styling",
      duration: 120,
      price: 85.0,
      active: true,
    },
  })

  const service3 = await prisma.petService.create({
    data: {
      title: "Veterinary Checkup",
      type: "vet-checkup",
      description: "Comprehensive health examination by licensed veterinarian",
      duration: 30,
      price: 75.0,
      active: true,
    },
  })

  const service4 = await prisma.petService.create({
    data: {
      title: "Vaccination",
      type: "vet-checkup",
      description: "Routine vaccination service",
      duration: 15,
      price: 45.0,
      active: true,
    },
  })

  const service5 = await prisma.petService.create({
    data: {
      title: "Pet Bath",
      type: "bath",
      description: "Basic bath and dry service",
      duration: 45,
      price: 35.0,
      active: true,
    },
  })

  const service6 = await prisma.petService.create({
    data: {
      title: "Overnight Boarding",
      type: "boarding",
      description: "24-hour boarding with meals and exercise",
      duration: 1440,
      price: 60.0,
      active: true,
    },
  })

  const service7 = await prisma.petService.create({
    data: {
      title: "Basic Training",
      type: "training",
      description: "One-on-one basic obedience training session",
      duration: 60,
      price: 80.0,
      active: true,
    },
  })

  // Create Appointments
  console.log("📅 Creating appointments...")
  const appointment1 = await prisma.appointment.create({
    data: {
      petId: pet1.id,
      serviceId: service3.id,
      staffId: vet1.id,
      date: new Date("2024-12-20T10:00:00Z"),
      status: "CONFIRMED",
      notes: "Annual checkup. Check for any health concerns.",
    },
  })

  const appointment2 = await prisma.appointment.create({
    data: {
      petId: pet2.id,
      serviceId: service1.id,
      staffId: groomer.id,
      date: new Date("2024-12-21T14:00:00Z"),
      status: "PENDING",
      notes: "First time grooming. Be gentle.",
    },
  })

  const appointment3 = await prisma.appointment.create({
    data: {
      petId: pet3.id,
      serviceId: service4.id,
      staffId: vet2.id,
      date: new Date("2024-12-18T09:30:00Z"),
      status: "COMPLETED",
      notes: "Rabies vaccination due.",
    },
  })

  const appointment4 = await prisma.appointment.create({
    data: {
      petId: pet4.id,
      serviceId: service5.id,
      staffId: groomer.id,
      date: new Date("2024-12-19T11:00:00Z"),
      status: "COMPLETED",
      notes: "Regular bath service.",
    },
  })

  const appointment5 = await prisma.appointment.create({
    data: {
      petId: pet5.id,
      serviceId: service3.id,
      staffId: vet1.id,
      date: new Date("2024-12-22T15:00:00Z"),
      status: "PENDING",
      notes: "Follow-up appointment after treatment.",
    },
  })

  const appointment6 = await prisma.appointment.create({
    data: {
      petId: pet1.id,
      serviceId: service2.id,
      staffId: groomer.id,
      date: new Date("2024-12-23T10:00:00Z"),
      status: "PENDING",
      notes: "Holiday grooming session.",
    },
  })

  // Create Vaccinations
  console.log("💉 Creating vaccinations...")
  await prisma.vaccination.create({
    data: {
      petId: pet1.id,
      vaccineName: "Rabies",
      dateGiven: new Date("2024-01-15"),
      nextDue: new Date("2025-01-15"),
      notes: "Annual rabies vaccination. No adverse reactions.",
    },
  })

  await prisma.vaccination.create({
    data: {
      petId: pet1.id,
      vaccineName: "DHPP",
      dateGiven: new Date("2024-01-15"),
      nextDue: new Date("2025-01-15"),
      notes: "Combined vaccine for distemper, hepatitis, parainfluenza, and parvovirus.",
    },
  })

  await prisma.vaccination.create({
    data: {
      petId: pet2.id,
      vaccineName: "FVRCP",
      dateGiven: new Date("2024-02-20"),
      nextDue: new Date("2025-02-20"),
      notes: "Feline viral rhinotracheitis, calicivirus, and panleukopenia vaccine.",
    },
  })

  await prisma.vaccination.create({
    data: {
      petId: pet3.id,
      vaccineName: "Rabies",
      dateGiven: new Date("2024-12-18"),
      nextDue: new Date("2025-12-18"),
      notes: "Rabies booster shot administered.",
    },
  })

  await prisma.vaccination.create({
    data: {
      petId: pet5.id,
      vaccineName: "DHPP",
      dateGiven: new Date("2024-06-10"),
      nextDue: new Date("2025-06-10"),
      notes: "Routine vaccination. Pet handled well.",
    },
  })

  // Create Medical Records
  console.log("🏥 Creating medical records...")
  await prisma.medicalRecord.create({
    data: {
      petId: pet1.id,
      title: "Annual Health Check",
      description: "Comprehensive annual health examination",
      diagnosis: "Healthy. No issues detected.",
      treatment: "Continue regular exercise and balanced diet.",
      date: new Date("2024-11-15"),
    },
  })

  await prisma.medicalRecord.create({
    data: {
      petId: pet3.id,
      title: "Skin Allergy Treatment",
      description: "Pet presented with skin irritation and itching",
      diagnosis: "Allergic dermatitis, likely food-related",
      treatment: "Prescribed antihistamine and hypoallergenic diet. Follow up in 2 weeks.",
      date: new Date("2024-10-05"),
    },
  })

  await prisma.medicalRecord.create({
    data: {
      petId: pet5.id,
      title: "Ear Infection",
      description: "Pet showing signs of ear discomfort and discharge",
      diagnosis: "Bacterial ear infection",
      treatment: "Antibiotic ear drops prescribed. Clean ears daily for 7 days.",
      date: new Date("2024-09-20"),
    },
  })

  await prisma.medicalRecord.create({
    data: {
      petId: pet2.id,
      title: "Dental Cleaning",
      description: "Routine dental cleaning and examination",
      diagnosis: "Mild tartar buildup",
      treatment: "Professional cleaning performed. Recommend dental treats.",
      date: new Date("2024-08-12"),
    },
  })

  // Create Prescriptions
  console.log("💊 Creating prescriptions...")
  await prisma.prescription.create({
    data: {
      petId: pet3.id,
      issuedById: vet1.id,
      medicineName: "Cetirizine 10mg",
      dosage: "1 tablet daily",
      instructions: "Give with food. Continue for 14 days. Monitor for drowsiness.",
      dateIssued: new Date("2024-10-05"),
    },
  })

  await prisma.prescription.create({
    data: {
      petId: pet5.id,
      issuedById: vet2.id,
      medicineName: "Ear Drops - Neomycin",
      dosage: "3 drops in each ear, twice daily",
      instructions: "Clean ear before applying. Continue for 7 days even if symptoms improve.",
      dateIssued: new Date("2024-09-20"),
    },
  })

  await prisma.prescription.create({
    data: {
      petId: pet1.id,
      issuedById: vet1.id,
      medicineName: "Heartworm Prevention",
      dosage: "1 tablet monthly",
      instructions: "Give on the same date each month. Continue year-round.",
      dateIssued: new Date("2024-11-15"),
    },
  })

  // Create Invoices
  console.log("🧾 Creating invoices...")
  const invoice1 = await prisma.invoice.create({
    data: {
      appointmentId: appointment3.id,
      amount: 45.0,
      status: "PAID",
      notes: "Rabies vaccination service completed successfully.",
    },
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      appointmentId: appointment4.id,
      amount: 35.0,
      status: "PAID",
      notes: "Regular bath service for Whiskers.",
    },
  })

  const invoice3 = await prisma.invoice.create({
    data: {
      appointmentId: appointment1.id,
      amount: 75.0,
      status: "UNPAID",
      notes: "Annual health checkup for Buddy. Payment pending.",
    },
  })

  const invoice4 = await prisma.invoice.create({
    data: {
      appointmentId: appointment2.id,
      amount: 50.0,
      status: "UNPAID",
      notes: "First time grooming for Luna. Please handle gently.",
    },
  })

  // Create Payments
  console.log("💳 Creating payments...")
  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      method: "stripe",
      transactionId: "pi_" + Date.now() + "_001",
      stripePaymentIntentId: "pi_" + Date.now() + "_001",
      amount: 45.0,
      status: "COMPLETED",
      paidAt: new Date("2024-12-18T10:00:00Z"),
    },
  })

  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      method: "cash",
      amount: 35.0,
      status: "COMPLETED",
      paidAt: new Date("2024-12-19T12:00:00Z"),
    },
  })

  console.log("✅ Database seed completed successfully!")
  console.log("\n📊 Summary:")
  console.log(`   - Users: 8 (1 Super Admin, 1 Admin, 3 Staff, 3 Customers)`)
  console.log(`   - Pets: 6`)
  console.log(`   - Services: 7`)
  console.log(`   - Appointments: 6`)
  console.log(`   - Vaccinations: 5`)
  console.log(`   - Medical Records: 4`)
  console.log(`   - Prescriptions: 3`)
  console.log(`   - Invoices: 4`)
  console.log(`   - Payments: 2`)
  console.log("\n🔑 Test Credentials:")
  console.log("   Super Admin: superadmin@petcare.com / password123")
  console.log("   Admin: admin@petcare.com / password123")
  console.log("   Staff: sarah.johnson@petcare.com / password123")
  console.log("   Customer: john.doe@example.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

