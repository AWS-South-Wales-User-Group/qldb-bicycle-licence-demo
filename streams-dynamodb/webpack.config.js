module.exports = {
    entry: {
      'functions/qldb-streams-dynamodb': './functions/qldb-streams-dynamodb.js',
      'functions/dynamodb-search': './functions/dynamodb-search.js',
      'functions/dynamodb-findall': './functions/dynamodb-findall.js'
    },
    mode: 'production',
    target: 'node',
  };