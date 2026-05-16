// ==================== 角色卡池数据 ====================
const star1Chars = [
    "斯巴达克斯", "阿斯忒里俄斯", "佐佐木小次郎", "莫扎特", "玛塔 哈利",
    "保罗 班扬", "阿拉什", "伊阿宋", "巴沙洛缪 罗伯茨", "夏绿蒂 科黛"
];

const star2Chars = [
    "莎士比亚", "列奥尼达斯一世", "咒腕哈桑"
];

const star3Chars = [
    "盖乌斯 尤里乌斯 凯撒", "吉尔 德 雷", "弗格斯 马克 罗伊", "罗宾汉",
    "库 丘林", "库 丘林【Prototype】", "罗缪路斯", "美杜莎", "牛若丸",
    "亚历山大", "美狄亚", "荆轲", "吕布奉先", "大流士三世", "大卫",
    "赫克托耳", "迪尔姆德 奥迪那", "冯 霍恩海姆 帕拉塞尔苏斯"
];

const star4Chars = [
    "巴御前", "望月千代女", "柳生但马守宗矩", "加藤段藏", "伊利酱II号机",
    "喀耳刻", "哪吒", "示巴女王", "浅上藤乃", "阿塔兰忒【Alter】",
    "喀戎", "齐格", "瓦尔基里", "贞德【AlterBerserker】", "牛若丸【Assassin】",
    "茨生童子【Lancer】", "迷之女主角XX", "迪尔姆德 奥迪纳【Saber】",
    "酒吞童子【Caster】", "兰陵王"
];

const star5Chars = [
    "阿尔托莉雅 潘德拉贡", "阿提拉", "吉尔伽美什", "诸葛孔明 【艾尔梅洛伊二世】",
    "费拉德三十", "贞德(1)", "俄里翁", "玉藻前", "冲田总司", "斯卡哈",
    "开膛手杰克", "莫德雷德", "阿周那", "迦尔纳", "迷之女主角X", "布伦希尔德"
];

// 概率配置（万分比）
// 五星: 0.005% = 0.5/10000
// 四星: 0.008% = 0.8/10000
// 三星: 剩余
const PROBABILITY = {
    STAR5: 0.5,     // 万分之0.5 = 0.005%
    STAR4: 0.8,     // 万分之0.8 = 0.008%
    STAR3: 10000 - 0.5 - 0.8,  // 剩下的都是三星及以下
    STAR2: 3500,    // 35% 用单独逻辑处理
    STAR1: 5000     // 50%
};

// 保底
const PITY_5 = 330;      // 330抽保底五星
const PITY_4 = 10;       // 10抽保底四星

let state = {
    totalPulls: 0,
    pityCount5: 0,       // 距离上次五星的抽数
    pityCount4: 0,       // 距离上次四星及以上的抽数
    star5Count: 0,
    star4Count: 0,
    history: []
};

function getRandomChar(star) {
    let arr;
    if (star === 5) arr = star5Chars;
    else if (star === 4) arr = star4Chars;
    else if (star === 3) arr = star3Chars;
    else if (star === 2) arr = star2Chars;
    else arr = star1Chars;
    return arr[Math.floor(Math.random() * arr.length)];
}

function pullOneCard() {
    let starNum = null;
    
    // 1. 检查五星保底
    if (state.pityCount5 + 1 >= PITY_5) {
        starNum = 5;
    }
    // 2. 检查四星保底
    else if (state.pityCount4 + 1 >= PITY_4) {
        // 保底四星，但仍有概率出五星
        let rand = Math.random() * 10000;
        if (rand < PROBABILITY.STAR5) {
            starNum = 5;
        } else {
            starNum = 4;
        }
    }
    // 3. 正常抽卡
    else {
        let rand = Math.random() * 10000;
        
        if (rand < PROBABILITY.STAR5) {
            starNum = 5;
        } else if (rand < PROBABILITY.STAR5 + PROBABILITY.STAR4) {
            starNum = 4;
        } else if (rand < PROBABILITY.STAR5 + PROBABILITY.STAR4 + PROBABILITY.STAR3) {
            // 三星及以下，需要进一步区分 1/2/3星
            let subRand = Math.random() * 10000;
            if (subRand < PROBABILITY.STAR1) {
                starNum = 1;
            } else if (subRand < PROBABILITY.STAR1 + PROBABILITY.STAR2) {
                starNum = 2;
            } else {
                starNum = 3;
            }
        } else {
            // 剩下的是三星及以下
            let subRand = Math.random() * 10000;
            if (subRand < PROBABILITY.STAR1) {
                starNum = 1;
            } else if (subRand < PROBABILITY.STAR1 + PROBABILITY.STAR2) {
                starNum = 2;
            } else {
                starNum = 3;
            }
        }
    }
    
    // 获取角色名
    let charName = getRandomChar(starNum);
    
    // 更新计数
    if (starNum === 5) {
        state.star5Count++;
        state.pityCount5 = 0;
        state.pityCount4 = 0;
    } else {
        state.pityCount5++;
        if (starNum === 4) {
            state.star4Count++;
            state.pityCount4 = 0;
        } else {
            state.pityCount4++;
        }
    }
    state.totalPulls++;
    
    let starName = starNum === 5 ? "五星" : (starNum === 4 ? "四星" : (starNum === 3 ? "三星" : (starNum === 2 ? "二星" : "一星")));
    
    return {
        name: charName,
        star: starNum,
        starName: starName,
        time: new Date().toLocaleTimeString()
    };
}

function performPull(count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const card = pullOneCard();
        results.push(card);
        state.history.unshift(card);
        if (state.history.length > 50) state.history.pop();
    }
    
    displayResults(results);
    updateUI();
    saveData();
    
    const hasFiveStar = results.some(c => c.star === 5);
    if (hasFiveStar) {
        const container = document.getElementById('resultArea');
        container.classList.add('flash-golden');
        setTimeout(() => container.classList.remove('flash-golden'), 600);
    }
}

function displayResults(cards) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = '';
    
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        let rarityClass = '';
        if (card.star === 5) rarityClass = 'card-star5';
        else if (card.star === 4) rarityClass = 'card-star4';
        else if (card.star === 3) rarityClass = 'card-star3';
        else if (card.star === 2) rarityClass = 'card-star2';
        else rarityClass = 'card-star1';
        cardDiv.className = `card ${rarityClass}`;
        
        let imgPath = `P/${card.name}.png`;
        let starDisplay = '★'.repeat(card.star);
        
        cardDiv.innerHTML = `
            <img class="card-img" src="${imgPath}" alt="${card.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%23333355\'/%3E%3Ctext x=\'40\' y=\'45\' text-anchor=\'middle\' fill=\'%23aaa\' font-size=\'12\'%3E%3C/text%3E%3C/svg%3E'">
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">${starDisplay} ${card.starName}</div>
        `;
        resultArea.appendChild(cardDiv);
    });
    
    updateHistoryList();
}

function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (state.history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">暂无记录</div>';
        return;
    }
    
    historyList.innerHTML = '';
    state.history.slice(0, 50).forEach(record => {
        const item = document.createElement('div');
        let starClass = '';
        if (record.star === 5) starClass = 'history-star5';
        else if (record.star === 4) starClass = 'history-star4';
        else if (record.star === 3) starClass = 'history-star3';
        else if (record.star === 2) starClass = 'history-star2';
        else starClass = 'history-star1';
        
        item.className = `history-item ${starClass}`;
        let starIcon = '★'.repeat(record.star);
        
        item.innerHTML = `
            <span>${starIcon} ${record.name} 【${record.starName}】</span>
            <span style="font-size: 0.7rem;">${record.time}</span>
        `;
        historyList.appendChild(item);
    });
}

function updateUI() {
    document.getElementById('totalPulls').textContent = state.totalPulls;
    document.getElementById('pityCount').textContent = state.pityCount5;
    document.getElementById('star5Count').textContent = state.star5Count;
    document.getElementById('star4Count').textContent = state.star4Count;
    
    const pityElem = document.getElementById('pityCount');
    if (state.pityCount5 >= 300) {
        pityElem.style.color = '#ff6a3a';
        pityElem.style.textShadow = '0 0 5px #ff6a3a';
    } else {
        pityElem.style.color = '#fff';
        pityElem.style.textShadow = 'none';
    }
}

function saveData() {
    localStorage.setItem('gachaData', JSON.stringify({
        totalPulls: state.totalPulls,
        pityCount5: state.pityCount5,
        pityCount4: state.pityCount4,
        star5Count: state.star5Count,
        star4Count: state.star4Count,
        history: state.history.slice(0, 100)
    }));
}

function loadData() {
    const saved = localStorage.getItem('gachaData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
            updateUI();
            updateHistoryList();
        } catch(e) {}
    }
}

function resetData() {
    if (confirm('确定要重置所有抽卡数据吗？这将清空你的记录！')) {
        state = {
            totalPulls: 0,
            pityCount5: 0,
            pityCount4: 0,
            star5Count: 0,
            star4Count: 0,
            history: []
        };
        updateUI();
        updateHistoryList();
        document.getElementById('resultArea').innerHTML = '<div class="placeholder-text">数据已重置~</div>';
        saveData();
    }
}

function singlePull() {
    performPull(1);
}

function elevenPull() {
    performPull(11);
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    updateHistoryList();
    
    document.getElementById('singlePull').addEventListener('click', singlePull);
    document.getElementById('elevenPull').addEventListener('click', elevenPull);
    document.getElementById('resetBtn').addEventListener('click', resetData);
});