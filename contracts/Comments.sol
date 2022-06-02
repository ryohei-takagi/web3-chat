//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Comments {
    struct Comment {
        uint32 id;
        address creator_address;
        string message;
        uint created_at;
    }

    uint32 private idCounter;
    Comment[] private comments;

    event CommentAdded(Comment comment);

    function getComments() public view returns(Comment[] memory) {
        return comments;
    }

    function addComment(string calldata message) public {
        Comment memory comment = Comment({
            id: idCounter,
            creator_address: msg.sender,
            message: message,
            created_at: block.timestamp
        });
        comments.push(comment);
        idCounter++;
        emit CommentAdded(comment);
    }
}
