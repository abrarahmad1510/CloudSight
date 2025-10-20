// Test file to check Apollo exports
console.log('=== Testing Apollo Client 4.0.7 Exports ===');

// Test core exports
import('@apollo/client/core').then(module => {
  console.log('Core exports:', Object.keys(module).sort());
}).catch(err => {
  console.log('Core import error:', err.message);
});

// Test react exports  
import('@apollo/client/react').then(module => {
  console.log('React exports:', Object.keys(module).sort());
}).catch(err => {
  console.log('React import error:', err.message);
});

// Test main exports
import('@apollo/client').then(module => {
  console.log('Main exports:', Object.keys(module).sort());
}).catch(err => {
  console.log('Main import error:', err.message);
});
