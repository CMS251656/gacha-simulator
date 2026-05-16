// ==================== 角色卡池数据 ====================
// 1星角色
const star1Chars = [
    "斯巴达克斯", "阿斯忒里俄斯", "佐佐木小次郎", "莫扎特", "玛塔 哈利",
    "保罗 班扬", "阿拉什", "伊阿宋", "巴沙洛缪 罗伯茨", "夏绿蒂 科黛"
];

// 2星角色
const star2Chars = [
    "莎士比亚", "列奥尼达斯一世", "咒腕哈桑"
];

// 3星角色
const star3Chars = [
    "盖乌斯 尤里乌斯 凯撒", "吉尔 德 雷", "弗格斯 马克 罗伊", "罗宾汉",
    "库 丘林", "库 丘林【Prototype】", "罗缪路斯", "美杜莎", "牛若丸",
    "亚历山大", "美狄亚", "荆轲", "吕布奉先", "大流士三世", "大卫",
    "赫克托耳", "迪尔姆德 奥迪那", "冯 霍恩海姆 帕拉塞尔苏斯"
];

// 4星角色
const star4Chars = [
    "巴御前", "望月千代女", "柳生但马守宗矩", "加藤段藏", "伊利酱II号机",
    "喀耳刻", "哪吒", "示巴女王", "浅上藤乃", "阿塔兰忒【Alter】",
    "喀戎", "齐格", "瓦尔基里", "贞德【AlterBerserker】", "牛若丸【Assassin】",
    "茨生童子【Lancer】", "迷之女主角XX", "迪尔姆德 奥迪纳【Saber】",
    "酒吞童子【Caster】", "兰陵王"
];

// 5星角色
const star5Chars = [
    "阿尔托莉雅 潘德拉贡", "阿提拉", "吉尔伽美什", "诸葛孔明 【艾尔梅洛伊二世】",
    "费拉德三十", "贞德(1)", "俄里翁", "玉藻前", "冲田总司", "斯卡哈",
    "开膛手杰克", "莫德雷德", "阿周那", "迦尔纳", "迷之女主角X", "布伦希尔德"
];

// 抽卡配置
// 五星概率 0.005% = 0.00005
// 四星概率 0.008% = 0.00008
// 三星概率 14.987% = 0.14987
// 二星概率 35% = 0.35
// 一星概率 50% = 0.50
const RARITY = {
    STAR1: { name: '一星', rate: 0.50, color: 'star1', starNum: 1 },       // 50%
    STAR2: { name: '二星', rate: 0.35, color: 'star2', starNum: 2 },       // 35%
    STAR3: { name: '三星', rate: 0.14987, color: 'star3', starNum: 3 },    // 14.987%
    STAR4: { name: '四星', rate: 0.00008, color: 'star4', starNum: 4 },    // 0.008%
    STAR5: { name: '五星', rate: 0.00005, color: 'star5', starNum: 5 }     // 0.005%
};

const PITY_LIMIT = 330;  // 330抽保底

// 状态存储
let state = {
    totalPulls: 0,
    pityCount: 0,
    star5Count: 0,
    star4Count: 0,
    history: []
};

// 根据星级获取随机角色名
function getRandomCharByStar(star) {
    let arr;
    switch(star) {
        case 1: arr = star1Chars; break;
        case 2: arr = star2Chars; break;
        case 3: arr = star3Chars; break;
        case 4: arr = star4Chars; break;
        case 5: arr = star5Chars; break;
        default: arr = star3Chars;
    }
    return arr[Math.floor(Math.random() * arr.length)];
}

// 抽一张卡（每一抽独立计算概率）
function pullOneCard() {
    // 检查330保底
    let isGuarantee5 = (state.pityCount + 1 >= PITY_LIMIT);
    
    // 检查连续低星（每10抽保底四星机制）
    let consecutiveLow = 0;
    for (let i = state.history.length - 1; i >= 0; i--) {
        let star = state.history[i].star;
        if (star <= 3) {
            consecutiveLow++;
        } else {
            break;
        }
        if (consecutiveLow >= 9) break;
    }
    let isGuarantee4 = (consecutiveLow >= 9);
    
    let rarity = null;
    let starNum = null;
    
    if (isGuarantee5) {
        rarity = 'STAR5';
        starNum = 5;
    } else if (isGuarantee4) {
        // 保底四星，但仍有概率出五星（按比例）
        let rand = Math.random();
        let fiveRate = RARITY.STAR5.rate / (RARITY.STAR5.rate + RARITY.STAR4.rate);
        if (rand < fiveRate) {
            rarity = 'STAR5';
            starNum = 5;
        } else {
            rarity = 'STAR4';
            starNum = 4;
        }
    } else {
        let rand = Math.random();
        
        if (rand < RARITY.STAR5.rate) {
            rarity = 'STAR5';
            starNum = 5;
        } else if (rand < RARITY.STAR5.rate + RARITY.STAR4.rate) {
            rarity = 'STAR4';
            starNum = 4;
        } else if (rand < RARITY.STAR5.rate + RARITY.STAR4.rate + RARITY.STAR3.rate) {
            rarity = 'STAR3';
            starNum = 3;
        } else if (rand < RARITY.STAR5.rate + RARITY.STAR4.rate + RARITY.STAR3.rate + RARITY.STAR2.rate) {
            rarity = 'STAR2';
            starNum = 2;
        } else {
            rarity = 'STAR1';
            starNum = 1;
        }
    }
    
    // 获取角色名
    let charName = getRandomCharByStar(starNum);
    
    // 更新计数
    if (starNum === 5) {
        state.star5Count++;
        state.pityCount = 0;
    } else {
        state.pityCount++;
    }
    if (starNum === 4) {
        state.star4Count++;
    }
    state.totalPulls++;
    
    return {
        name: charName,
        star: starNum,
        rarityKey: rarity,
        starName: RARITY[rarity].name,
        time: new Date().toLocaleTimeString()
    };
}

// 执行抽卡（单抽或十一连）- 每一抽单独计算
function performPull(count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const card = pullOneCard();  // 每一抽都独立调用，概率独立计算
        results.push(card);
        state.history.unshift(card);
        if (state.history.length > 50) state.history.pop();
    }
    
    displayResults(results);
    updateUI();
    saveData();
    
    // 五星闪光特效
    const hasFiveStar = results.some(c => c.star === 5);
    if (hasFiveStar) {
        const container = document.getElementById('resultArea');
        container.classList.add('flash-golden');
        setTimeout(() => container.classList.remove('flash-golden'), 600);
        
        // 五星特效：页面震动一下
        document.body.style.animation = 'shake 0.3s ease';
        setTimeout(() => document.body.style.animation = '', 300);
    }
}

// 显示抽卡结果（带图片）
function displayResults(cards) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = '';
    
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card card-${card.rarityKey.toLowerCase()}`;
        
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

// 更新历史记录
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

// 更新UI
function updateUI() {
    document.getElementById('totalPulls').textContent = state.totalPulls;
    document.getElementById('pityCount').textContent = state.pityCount;
    document.getElementById('star5Count').textContent = state.star5Count;
    document.getElementById('star4Count').textContent = state.star4Count;
    
    const pityElem = document.getElementById('pityCount');
    if (state.pityCount >= 300) {
        pityElem.style.color = '#ff6a3a';
        pityElem.style.textShadow = '0 0 5px #ff6a3a';
    } else {
        pityElem.style.color = '#fff';
        pityElem.style.textShadow = 'none';
    }
}

// 保存数据
function saveData() {
    localStorage.setItem('gachaData', JSON.stringify({
        totalPulls: state.totalPulls,
        pityCount: state.pityCount,
        star5Count: state.star5Count,
        star4Count: state.star4Count,
        history: state.history.slice(0, 100)
    }));
}

// 加载数据
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

// 重置数据
function resetData() {
    if (confirm('确定要重置所有抽卡数据吗？这将清空你的记录！')) {
        state = {
            totalPulls: 0,
            pityCount: 0,
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

// 单抽
function singlePull() {
    performPull(1);
}

// 十一连
function elevenPull() {
    performPull(11);
}

// 震动动画
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
`;
document.head.appendChild(style);

// 绑定事件
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    updateHistoryList();
    
    document.getElementById('singlePull').addEventListener('click', singlePull);
    document.getElementById('elevenPull').addEventListener('click', elevenPull);
    document.getElementById('resetBtn').addEventListener('click', resetData);
});