module.exports = {
    AddNode: require('./AddNode'),          // 23
    ClearNodes: require('./ClearNodes'),    // 4
    UpdatePosition: require('./UpdatePosition'), // 3 在ClearNode之后
    SetBorder: require('./SetBorder'),      // 1777
    UpdateNodes: require('./UpdateNodes'),  // 1774 ≈ SetBorder
    UpdateLeaderboard: require('./UpdateLeaderboard'), // 163 => * 11 ≈ SetBorder
    DrawLine: require('./DrawLine'),
    // DBuffer 1937, UpdateNode + UpdateLeaderboard
};
