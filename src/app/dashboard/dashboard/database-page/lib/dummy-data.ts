import { Contact, Farmer, Provider, Agent } from "@/types/types";

const firstNames = [
  "Jane",
  "Wade",
  "Esther",
  "Jenny",
  "Guy",
  "Jacob",
  "Ronald",
  "Devon",
  "Jerome",
  "Leslie",
  "Arthur",
  "Kathryn",
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Edward",
  "Fiona",
  "George",
  "Hannah",
  "Isaac",
  "Julia",
  "Kevin",
  "Laura",
  "Michael",
  "Nicole",
  "Oliver",
  "Patricia",
  "Quinn",
  "Rachel",
  "Steven",
  "Tina",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
  "Yara",
  "Zachary",
  "Amy",
  "Ben",
  "Chloe",
];
const lastNames = [
  "Cooper",
  "Warren",
  "Howard",
  "Wilson",
  "Hawkins",
  "Jones",
  "Richards",
  "Lane",
  "Bell",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
];
const types: ("Farmer" | "Agent" | "Provider")[] = [
  "Farmer",
  "Agent",
  "Provider",
];
const regions = [
  "Ashanti Region",
  "Greater Accra",
  "Western Region",
  "Central Region",
  "Eastern Region",
  "Northern Region",
  "Volta Region",
  "Oti Region",
  "Ahafo Region",
  "Bono Region",
];
const districts = [
  "Kumasi",
  "Accra",
  "Tema",
  "Sekondi-Takoradi",
  "Cape Coast",
  "Tamale",
  "Ho",
  "Koforidua",
  "Sunyani",
  "Techiman",
];
const farmNames = [
  "Green Valley Farms",
  "Sunrise Agriculture",
  "Golden Harvest",
  "Nature's Best Farms",
  "Progressive Farms",
  "Heritage Agriculture",
  "Fertile Land Farms",
  "Eco-Friendly Farms",
];
const crops: ("Maize" | "Wheat" | "Rice" | "Cassava")[] = [
  "Maize",
  "Wheat",
  "Rice",
  "Cassava",
];
const services = [
  "Farming Supplies",
  "Pesticides",
  "Fertilizers",
  "Equipment Rental",
  "Transportation",
  "Storage",
  "Seed Distribution",
  "Agricultural Training",
  "Market Access",
];
const genders: ("Male" | "Female")[] = ["Male", "Female"];

function generateContacts(count: number): Contact[] {
  const contacts: Contact[] = [];
  const usedCombos = new Set<string>();
  let id = 1;

  while (contacts.length < count) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const combo = `${firstName}-${lastName}`;

    if (usedCombos.has(combo)) continue;
    usedCombos.add(combo);

    const type = types[Math.floor(Math.random() * types.length)];
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const year = Math.floor(Math.random() * (2024 - 2010)) + 2010;
    const region = regions[Math.floor(Math.random() * regions.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];

    const baseContact = {
      id: String(id++),
      firstName,
      otherNames: firstNames[Math.floor(Math.random() * firstNames.length)],
      gender,
      phone: `0555${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0")}`,
      registrationDate: `${month}/${day}/${year}`,
      initials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
      region,
      district,
    };

    if (type === "Farmer") {
      contacts.push({
        ...baseContact,
        type: "Farmer",
        farmName: farmNames[Math.floor(Math.random() * farmNames.length)],
        farmSize: Math.floor(Math.random() * 50) + 1,
        farmSizeUnit: "Acre",
        crops: [
          crops[Math.floor(Math.random() * crops.length)],
          crops[Math.floor(Math.random() * crops.length)],
        ],
        formLocation: `${Math.random().toFixed(4)}, ${Math.random().toFixed(
          4
        )}`,
      } as Farmer);
    } else if (type === "Provider") {
      const numServices = Math.floor(Math.random() * 3) + 1;
      const selectedServices = [];
      for (let i = 0; i < numServices; i++) {
        selectedServices.push(
          services[Math.floor(Math.random() * services.length)]
        );
      }
      contacts.push({
        ...baseContact,
        type: "Provider",
        services: selectedServices,
      } as Provider);
    } else {
      contacts.push({
        ...baseContact,
        type: "Agent",
        assignedRegion: region,
      } as Agent);
    }
  }

  return contacts;
}

export const dummyContacts: Contact[] = generateContacts(52);
