import listComments from './listComments';
import addComment from './addComment';
import deleteComment from './deleteComment';
import Comment from './Comment';

type AppSyncEvent = {
  info: {
    fieldName: string
  },
  arguments: {
    commentId: string,
    comment: Comment
  }
}

exports.handler = async (event:AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "listComments":
      return await listComments();
    case "addComment":
      return await addComment(event.arguments.comment);
    case "deleteComment":
      return await deleteComment(event.arguments.commentId);
    default:
      return null;
  }
}