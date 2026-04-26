// 1. 게임 기본 설정 (Config)
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade', // 2D 아케이드 물리 엔진 사용
        arcade: {
            gravity: { y: 600 }, // 중력 설정 (수치가 클수록 빨리 떨어짐)
            debug: false         // 개발 완료 시 false로 두세요.
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 2. 게임 객체 생성
const game = new Phaser.Game(config);

// 전역 변수 선언
let player;
let platforms;
let cursors;
let leaves;
let score = 0;
let scoreText;

// --- [Preload] 게임 시작 전 이미지/소리 파일 불러오기 ---
function preload() {
    // 임시 배경 (Phaser 기본 제공 이미지 사용)
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    
    // 준비하신 에셋 파일들 불러오기 (파일 이름이 다르면 여기를 수정하세요!)
    this.load.image('ground', 'assets/images/tileset.png'); // 바닥 타일
    this.load.image('leaf', 'assets/images/item_leaf.png'); // 찻잎 아이템
    
    // 캐릭터 (스프라이트 시트가 아닌 단일 이미지인 경우 image 사용)
    this.load.image('poi', 'assets/images/player.png'); 
}

// --- [Create] 화면에 요소 배치하고 규칙 정하기 ---
function create() {
    // 배경 추가
    this.add.image(400, 300, 'sky');

    // 1. 바닥(지형) 만들기
    platforms = this.physics.add.staticGroup(); // 고정된 물체 그룹

    // 화면 맨 아래에 바닥 깔기 (크기 조절: setScale)
    let ground = platforms.create(400, 580, 'ground').setScale(2).refreshBody();

    // 공중 플랫폼 만들기
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // 2. 플레이어(포이) 만들기
    player = this.physics.add.sprite(100, 450, 'poi');
    player.setBounce(0.1); // 바닥에 닿을 때 살짝 튕기는 정도
    player.setCollideWorldBounds(true); // 화면 밖으로 나가지 못하게 함

    // 3. 치유 아이템(찻잎) 흩뿌리기
    leaves = this.physics.add.group({
        key: 'leaf',
        repeat: 11, // 총 12개 생성
        setXY: { x: 12, y: 0, stepX: 70 } // x축으로 70씩 띄워서 배치
    });

    leaves.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // 떨어질 때 랜덤하게 튕김
    });

    // 4. 충돌 규칙 설정
    this.physics.add.collider(player, platforms); // 포이와 바닥이 부딪히게 함
    this.physics.add.collider(leaves, platforms);  // 찻잎과 바닥이 부딪히게 함

    // 포이가 찻잎에 닿았을 때 'collectLeaf' 함수 실행
    this.physics.add.overlap(player, leaves, collectLeaf, null, this);

    // 5. 점수판 UI 추가
    scoreText = this.add.text(16, 16, '치유 점수: 0', { fontSize: '32px', fill: '#fff', fontFamily: 'Malgun Gothic' });

    // 6. 키보드 입력 활성화
    cursors = this.input.keyboard.createCursorKeys();
}

// --- [Update] 매 프레임마다 키보드 입력 확인하기 ---
function update() {
    // 왼쪽 방향키 누를 때
    if (cursors.left.isDown) {
        player.setVelocityX(-200); // 왼쪽으로 이동
    } 
    // 오른쪽 방향키 누를 때
    else if (cursors.right.isDown) {
        player.setVelocityX(200); // 오른쪽으로 이동
    } 
    // 아무것도 안 누를 때
    else {
        player.setVelocityX(0); // 멈춤
    }

    // 위쪽 방향키(점프) 누를 때 (바닥에 닿아있을 때만 가능)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-450); // 위로 솟구치는 힘
    }
}

// --- [기능 함수] 찻잎을 먹었을 때 일어나는 일 ---
function collectLeaf(player, leaf) {
    leaf.disableBody(true, true); // 찻잎을 화면에서 없앰

    // 점수 10점 추가 및 화면 업데이트
    score += 10;
    scoreText.setText('치유 점수: ' + score);
}
