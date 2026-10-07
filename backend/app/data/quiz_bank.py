QUIZ_BANK = {
    "DSA": {
        "easy": [
            {"question": "What is the time complexity of accessing an array element by index?", "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"], "correct_index": 0},
            {"question": "Which data structure uses LIFO (Last In First Out)?", "options": ["Queue", "Stack", "Array", "Tree"], "correct_index": 1},
            {"question": "What does DSA stand for?", "options": ["Data Structures & Algorithms", "Digital Systems Architecture", "Data Storage Access", "Dynamic System Analysis"], "correct_index": 0},
        ],
        "medium": [
            {"question": "What is the time complexity of binary search?", "options": ["O(n)", "O(n log n)", "O(log n)", "O(1)"], "correct_index": 2},
            {"question": "Which traversal visits the root node first?", "options": ["Inorder", "Preorder", "Postorder", "Level order"], "correct_index": 1},
        ],
        "hard": [
            {"question": "What is the time complexity of building a heap from an array?", "options": ["O(n log n)", "O(n)", "O(log n)", "O(n^2)"], "correct_index": 1},
        ],
    },
    "System Design": {
        "easy": [
            {"question": "What does a load balancer primarily do?", "options": ["Store data", "Distribute traffic across servers", "Compress files", "Encrypt data"], "correct_index": 1},
        ],
        "medium": [
            {"question": "What is database sharding?", "options": ["Backing up data", "Splitting a database across multiple machines", "Compressing a database", "Encrypting a database"], "correct_index": 1},
        ],
        "hard": [
            {"question": "In a microservices architecture, what is a common way services communicate asynchronously?", "options": ["Direct function calls", "Message queues", "Shared memory", "Global variables"], "correct_index": 1},
        ],
    },
    "React": {
        "easy": [
            {"question": "Which hook is used to manage state in a functional component?", "options": ["useEffect", "useState", "useRef", "useContext"], "correct_index": 1},
        ],
        "medium": [
            {"question": "When does useEffect run by default?", "options": ["Only on mount", "After every render", "Only on unmount", "Never"], "correct_index": 1},
        ],
        "hard": [
            {"question": "What is the purpose of React's key prop in lists?", "options": ["Styling", "Help React identify which items changed", "Sorting", "Data storage"], "correct_index": 1},
        ],
    },
}

DEFAULT_QUIZ = {
    "easy": [
        {"question": "This topic's quiz bank is being built. Answer this placeholder to continue.", "options": ["Continue", "Skip", "Retry", "Exit"], "correct_index": 0},
    ],
    "medium": [],
    "hard": [],
}