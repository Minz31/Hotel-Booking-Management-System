// Generate Bcrypt Password Hash
// Run this to create admin password: node generate_hash.js

const bcrypt = require('bcryptjs');

const password = 'admin123'; // Change this to your desired password

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('\n✅ Password Hash Generated!\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nCopy this hash and use it in SQL:');
    console.log(`\nUPDATE administrators SET password_hash = '${hash}' WHERE email = 'admin@system.com';\n`);
});
