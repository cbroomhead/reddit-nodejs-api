function getCommentsForPostRecursive (postId, callback)  {
      function getComments(postId, parentIds, allComments, commentIdx, callback){
  
  var query;
  
  if(parentIds){
      if(parentIds.length === 0){
    callback(null, allComments);
    return;
  }
    query = `
          SELECT c.text, c.id, c.commentId FROM comments AS c
         WHERE c.postId = ${postId} AND c.commentId IN (${parentIds.join(',')})
         ORDER BY c.createdAt
    `;
  } else {
    query = `
      SELECT c.text, c.id, c.commentId FROM comments AS c
         WHERE c.postId = ${postId} AND c.commentId IS NULL
         ORDER BY c.createdAt
    `;
  }
  
  conn.query(query, function(err, res){
    var parentKeys = [];
    res.forEach(function(comment){
      if(commentIdx[comment.commentId]){
        commentIdx[comment.commentId].replies.push(comment);
      }
      parentKeys.push(comment.id);
      comment.replies = [];
      commentIdx[comment.id] = comment;
      if(comment.commentId === null) {
             allComments.push(comment);
      }
    })
     getComments(postId, parentKeys, allComments, commentIdx, callback);
  })
       
}   
      getComments(postId, null, [], {}, callback);
    }

  
getCommentsForPostRecursive(40, function (err, res){
  if(err){
    console.log(err)
  }
  else {
    console.log(res);
  }
} )