/**
 * Extract all prompts from Claude conversations.json
 * 
 * This script extracts all user prompts from the conversations.json file
 * that you can download from Claude's web interface data export.
 * 
 * To use:
 * 1. Save this as extract_prompts.js
 * 2. Run with Node.js: node extract_prompts.js path/to/conversations.json
 * 3. Optionally, you can use node extract_prompts.js path/to/conversations.json --debug to first print the file structure
 */

const fs = require('fs');
const path = require('path');

// Check if filepath was provided
if (process.argv.length < 3) {
  console.error('Please provide the path to conversations.json');
  console.error('Usage: node extract_prompts.js path/to/conversations.json [--debug]');
  process.exit(1);
}

const filePath = process.argv[2];
const debugMode = process.argv.includes('--debug');

// Read and parse the JSON file
try {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);
  
  // Debug mode - analyze and output the file structure
  if (debugMode) {
    console.log("File structure analysis:");
    console.log("Top-level keys:", Object.keys(data));
    
    // Check if conversations exists
    if (data.conversations) {
      console.log("Found 'conversations' array with", data.conversations.length, "items");
      if (data.conversations.length > 0) {
        console.log("Sample conversation keys:", Object.keys(data.conversations[0]));
        
        if (data.conversations[0].messages) {
          console.log("Sample message keys:", Object.keys(data.conversations[0].messages[0]));
        } else {
          console.log("No 'messages' found in conversation");
        }
      }
    } else {
      // Try to identify the right structure
      console.log("No 'conversations' array found. Analyzing structure further...");
      
      // Check if the file itself is an array of conversations
      if (Array.isArray(data)) {
        console.log("The file contains an array with", data.length, "items");
        if (data.length > 0) {
          console.log("First item keys:", Object.keys(data[0]));
        }
      }
      
      // Look for any arrays that might contain messages
      const findArrays = (obj, path = '') => {
        if (typeof obj !== 'object' || obj === null) return;
        
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          
          if (Array.isArray(obj[key])) {
            console.log(`Found array at '${newPath}' with ${obj[key].length} items`);
            if (obj[key].length > 0 && typeof obj[key][0] === 'object') {
              console.log(`Sample item keys at '${newPath}':`, Object.keys(obj[key][0]));
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            findArrays(obj[key], newPath);
          }
        });
      };
      
      findArrays(data);
    }
    
    // Exit after printing debug info
    console.log("\nPlease analyze the structure and modify the script accordingly");
    process.exit(0);
  }
  
  // Structure to hold extracted prompts by conversation
  const extractedData = [];
  
  // Determine the structure and extract conversations
  let conversations = [];
  
  if (data.conversations && Array.isArray(data.conversations)) {
    // Standard structure with conversations array
    conversations = data.conversations;
  } else if (Array.isArray(data)) {
    // The file itself is an array of conversations
    conversations = data;
  } else {
    // Try to find conversations in any property that is an array
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        // Check if this array contains objects that look like conversations
        // (having title, id, or messages properties)
        const firstItem = data[key][0];
        if (typeof firstItem === 'object' && 
            (firstItem.title || firstItem.id || firstItem.messages || firstItem.name)) {
          conversations = data[key];
          console.log(`Found conversations in '${key}' property`);
          break;
        }
      }
    }
  }
  
  if (conversations.length === 0) {
    throw new Error("Could not find conversations in the file. Try running with --debug option to analyze the structure.");
  }
  
  // Process each conversation
  conversations.forEach(conversation => {
    // Get conversation metadata, with fallbacks for different formats
    const conversationTitle = conversation.title || conversation.name || 'Untitled Conversation';
    const conversationId = conversation.id || conversation.uuid || 'unknown';
    const conversationDate = conversation.created_at ? 
      new Date(conversation.created_at).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];
    
    const promptsInConversation = [];
    
    // Find messages, which could be in different properties
    let messages = [];
    if (Array.isArray(conversation.messages)) {
      messages = conversation.messages;
    } else if (conversation.message_tree && Array.isArray(conversation.message_tree)) {
      messages = conversation.message_tree;
    } else if (conversation.turns && Array.isArray(conversation.turns)) {
      messages = conversation.turns;
    } else {
      // No messages found in standard locations
      for (const key in conversation) {
        if (Array.isArray(conversation[key]) && conversation[key].length > 0) {
          const firstItem = conversation[key][0];
          if (typeof firstItem === 'object' && 
              (firstItem.role || firstItem.sender || firstItem.content)) {
            messages = conversation[key];
            break;
          }
        }
      }
    }
    
    // Extract all human messages (prompts)
    messages.forEach(message => {
      // Check different possible structures for human messages
      const isHuman = 
        message.role === 'human' || 
        message.role === 'user' ||
        message.sender === 'human' || 
        message.sender === 'user' ||
        message.author === 'human' ||
        message.author === 'user';
      
      if (isHuman) {
        // Handle different content formats
        let content = '';
        if (typeof message.content === 'string') {
          content = message.content;
        } else if (Array.isArray(message.content)) {
          // Content might be an array of content parts
          content = message.content
            .map(part => typeof part === 'string' ? part : 
                 (part.text || part.value || JSON.stringify(part)))
            .join('\n');
        } else if (message.text) {
          content = message.text;
        } else if (message.value) {
          content = message.value;
        } else if (message.message) {
          content = typeof message.message === 'string' ? 
            message.message : JSON.stringify(message.message);
        } else {
          // If we can't find the content in standard places, stringify the whole message
          content = JSON.stringify(message);
        }
        
        promptsInConversation.push({
          timestamp: message.created_at || message.timestamp || message.time || 'unknown',
          content: content
        });
      }
    });
    
    // Only add conversations that have prompts
    if (promptsInConversation.length > 0) {
      extractedData.push({
        title: conversationTitle,
        id: conversationId,
        date: conversationDate,
        prompts: promptsInConversation
      });
    }
  });
  
  // Export to JSON
  const outputFilePath = path.join(path.dirname(filePath), 'extracted_prompts.json');
  fs.writeFileSync(outputFilePath, JSON.stringify(extractedData, null, 2));
  console.log(`Extracted ${extractedData.length} conversations with prompts to ${outputFilePath}`);
  
  // Also export to CSV for easy viewing
  const csvLines = ['Conversation Title,Conversation ID,Date,Prompt'];
  extractedData.forEach(convo => {
    convo.prompts.forEach(prompt => {
      // Escape commas and quotes in the prompt content
      const escapedContent = `"${prompt.content.replace(/"/g, '""')}"`;
      csvLines.push(`"${convo.title}","${convo.id}","${convo.date}",${escapedContent}`);
    });
  });
  
  const csvOutputPath = path.join(path.dirname(filePath), 'extracted_prompts.csv');
  fs.writeFileSync(csvOutputPath, csvLines.join('\n'));
  console.log(`Also exported data to CSV format at ${csvOutputPath}`);
  
} catch (error) {
  console.error('Error processing the conversations.json file:', error.message);
  console.error('Try running with --debug option to understand the file structure:');
  console.error('  node extract_prompts.js path/to/conversations.json --debug');
  process.exit(1);
}
