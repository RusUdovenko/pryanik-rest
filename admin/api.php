<?php
// Разрешаем запросы с любого домена (для разработки)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обрабатываем preflight запросы
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/menu_data.json';

// GET - получить все данные
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        $content = file_get_contents($dataFile);
        echo $content;
    } else {
        // Возвращаем пустую структуру
        echo json_encode([
            'main' => [],
            'kids' => [],
            'banquet' => [],
            'lastUpdate' => date('c')
        ]);
    }
}

// POST - сохранить все данные
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input) {
        $input['lastUpdate'] = date('c');
        $jsonData = json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($dataFile, $jsonData)) {
            echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save data']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
    }
}

// PUT - обновить конкретный тип меню
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $menuType = $_GET['type'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($menuType && in_array($menuType, ['main', 'kids', 'banquet'])) {
        $currentData = [];
        if (file_exists($dataFile)) {
            $currentData = json_decode(file_get_contents($dataFile), true);
        }
        
        $currentData[$menuType] = $input;
        $currentData['lastUpdate'] = date('c');
        
        if (file_put_contents($dataFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'Menu updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update menu']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid menu type']);
    }
}

// DELETE - удалить элемент (опционально)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $menuType = $_GET['type'] ?? '';
    $itemId = $_GET['id'] ?? '';
    
    if ($menuType && $itemId && in_array($menuType, ['main', 'kids', 'banquet'])) {
        $currentData = [];
        if (file_exists($dataFile)) {
            $currentData = json_decode(file_get_contents($dataFile), true);
        }
        
        if (isset($currentData[$menuType])) {
            $currentData[$menuType] = array_values(array_filter($currentData[$menuType], function($item) use ($itemId) {
                return $item['id'] != $itemId;
            }));
            $currentData['lastUpdate'] = date('c');
            
            if (file_put_contents($dataFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
                echo json_encode(['success' => true, 'message' => 'Item deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete item']);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    }
}
?>