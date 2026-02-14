// 🔧 FLEXIBLE API CONFIGURATION FOR REACT NATIVE
// For mobile testing (phone/tablet): use your computer's IP address
// For Android emulator: use 10.0.2.2 (maps to host's localhost)
// For iOS simulator: use localhost

// To find your IP: Run 'ipconfig' in terminal and look for IPv4 Address
const NETWORK_IP = "10.96.210.172"; // Auto-synced IP address

// For React Native, we use the network IP by default
// Change to "http://10.0.2.2:8080" if using Android Emulator
// Change to "http://localhost:8080" if using iOS Simulator
const BASE_URL = `http://${NETWORK_IP}:8080`;

export default BASE_URL;
