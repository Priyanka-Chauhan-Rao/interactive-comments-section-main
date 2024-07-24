const data = {
  currentUser: {
    image: {
      png: "./images/avatars/image-juliusomo.png",
      webp: "./images/avatars/image-juliusomo.webp",
    },
    username: "juliusomo",
  },
  comments: [
    {
      parent: 0,
      id: 1,
      content:
        "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
      createdAt: "1 month ago",
      score: 12,
      user: {
        image: {
          png: "./images/avatars/image-amyrobson.png",
          webp: "./images/avatars/image-amyrobson.webp",
        },
        username: "amyrobson",
      },
      replies: [],
    },
    {
      parent: 0,
      id: 2,
      content:
        "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into React as well soon. Perhaps you can give me an insight on where I can learn React? Thanks!",
      createdAt: "2 weeks ago",
      score: 5,
      user: {
        image: {
          png: "./images/avatars/image-maxblagun.png",
          webp: "./images/avatars/image-maxblagun.webp",
        },
        username: "maxblagun",
      },
      replies: [
        {
          parent: 2,
          id: 1,
          content:
            "If you're still new, I'd recommend focusing on the fundamentals of HTML, CSS, and JS before considering React. It's very tempting to jump ahead but lay a solid foundation first.",
          createdAt: "1 week ago",
          score: 4,
          replyingTo: "maxblagun",
          user: {
            image: {
              png: "./images/avatars/image-ramsesmiron.png",
              webp: "./images/avatars/image-ramsesmiron.webp",
            },
            username: "ramsesmiron",
          },
        },
        {
          parent: 2,
          id: 2,
          content:
            "I couldn't agree more with this. Everything moves so fast and it always seems like everyone knows the newest library/framework. But the fundamentals are what stay constant.",
          createdAt: "2 days ago",
          score: 2,
          replyingTo: "ramsesmiron",
          user: {
            image: {
              png: "./images/avatars/image-juliusomo.png",
              webp: "./images/avatars/image-juliusomo.webp",
            },
            username: "juliusomo",
          },
        },
      ],
    },
  ],
};

const appendFrag = (frag, parent) => {
  parent.appendChild(frag);
  return parent.lastElementChild;
};

const addComment = (body, parentId, replyTo = undefined) => {
  const commentParent =
    parentId === 0
      ? data.comments
      : data.comments.find((c) => c.id == parentId).replies;
  const newComment = {
    parent: parentId,
    id: commentParent.length
      ? commentParent[commentParent.length - 1].id + 1
      : 1,
    content: body,
    createdAt: "Now",
    replyingTo: replyTo,
    score: 0,
    replies: parentId === 0 ? [] : undefined,
    user: data.currentUser,
  };
  commentParent.push(newComment);
  initComments();
};

const deleteComment = (commentObject) => {
  const { parent } = commentObject;
  if (parent === 0) {
    data.comments = data.comments.filter((e) => e !== commentObject);
  } else {
    const parentComment = data.comments.find((e) => e.id === parent);
    parentComment.replies = parentComment.replies.filter(
      (e) => e !== commentObject
    );
  }
  initComments();
};

const promptDel = (commentObject) => {
  const modalWrp = document.querySelector(".modal-wrp");
  modalWrp.classList.remove("invisible");
  modalWrp.querySelector(".yes").onclick = () => {
    deleteComment(commentObject);
    modalWrp.classList.add("invisible");
  };
  modalWrp.querySelector(".no").onclick = () => {
    modalWrp.classList.add("invisible");
  };
};

const spawnReplyInput = (parent, parentId, replyTo) => {
  parent.querySelectorAll(".reply-input").forEach((e) => e.remove());
  const inputTemplate = document.querySelector(".reply-input-template");
  const inputNode = inputTemplate.content.cloneNode(true);
  const addedInput = appendFrag(inputNode, parent);
  addedInput.querySelector(".bu-primary").onclick = () => {
    const commentBody = addedInput.querySelector(".cmnt-input").value;
    if (commentBody.length) {
      addComment(commentBody, parentId, replyTo);
    }
  };
};

const createCommentNode = (commentObject) => {
  const commentTemplate = document.querySelector(".comment-template");
  const commentNode = commentTemplate.content.cloneNode(true);
  const { username, image } = commentObject.user;

  commentNode.querySelector(".usr-name").textContent = username;
  commentNode.querySelector(".usr-img").src = image.webp;
  commentNode.querySelector(".score-number").textContent = commentObject.score;
  commentNode.querySelector(".cmnt-at").textContent = commentObject.createdAt;
  commentNode.querySelector(".c-body").textContent = commentObject.content;
  if (commentObject.replyingTo) {
    commentNode.querySelector(
      ".reply-to"
    ).textContent = `@${commentObject.replyingTo}`;
  }

  const scorePlus = commentNode.querySelector(".score-plus");
  const scoreMinus = commentNode.querySelector(".score-minus");
  scorePlus.onclick = () => {
    commentObject.score++;
    initComments();
  };
  scoreMinus.onclick = () => {
    commentObject.score = Math.max(0, commentObject.score - 1);
    initComments();
  };

  if (username === data.currentUser.username) {
    commentNode.querySelector(".comment").classList.add("this-user");
    commentNode.querySelector(".delete").onclick = () =>
      promptDel(commentObject);
    commentNode.querySelector(".edit").onclick = (e) => {
      const path = e.currentTarget.closest(".comment").querySelector(".c-body");
      if (path.isContentEditable) {
        path.removeAttribute("contenteditable");
      } else {
        path.setAttribute("contenteditable", true);
        path.focus();
      }
    };
  }
  return commentNode;
};

const appendComment = (parentNode, commentNode, parentId) => {
  const bu_reply = commentNode.querySelector(".reply");
  const appendedCmnt = appendFrag(commentNode, parentNode);
  const replyTo = appendedCmnt.querySelector(".usr-name").textContent;
  bu_reply.onclick = () => {
    const targetParent = parentNode.classList.contains("replies")
      ? parentNode
      : appendedCmnt.querySelector(".replies");
    spawnReplyInput(targetParent, parentId, replyTo);
  };
};

function initComments(
  commentList = data.comments,
  parent = document.querySelector(".comments-wrp")
) {
  parent.innerHTML = "";
  commentList.forEach((element) => {
    const parentId = element.parent === 0 ? element.id : element.parent;
    const comment_node = createCommentNode(element);
    if (element.replies && element.replies.length) {
      initComments(element.replies, comment_node.querySelector(".replies"));
    }
    appendComment(parent, comment_node, parentId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initComments();
  const cmntInput = document.querySelector(".reply-input");
  cmntInput.querySelector(".bu-primary").onclick = () => {
    const commentBody = cmntInput.querySelector(".cmnt-input").value;
    if (commentBody.length) {
      addComment(commentBody, 0);
      cmntInput.querySelector(".cmnt-input").value = "";
    }
  };
});
