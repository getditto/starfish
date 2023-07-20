import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Button,
  TouchableOpacity,
} from 'react-native';

import React from 'react';
import {
  useLiveQuery,
  type DittoDocument,
  useMutations,
} from 'react-native-starfish';
import CheckboxComponent from './Checkbox';

interface Task extends DittoDocument {
  _id: string;
  body: string;
  isCompleted: boolean;
}

function MainPage() {
  const [newTaskBody, setNewTaskBody] = React.useState('');

  const { documents } = useLiveQuery({
    collection: 'tasks',
  });

  const { upsert, remove } = useMutations();
  const tasks: Task[] = documents as Task[];

  function addTask() {
    upsert('tasks', {
      body: newTaskBody,
      isCompleted: false,
    });
    setNewTaskBody('');
  }

  function toggleComplete(taskId: string) {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      upsert('tasks', {
        _id: taskId,
        isCompleted: !task.isCompleted,
      });
    }
  }

  function deleteTask(taskId: string) {
    remove({
      collection: 'tasks',
      find: '_id == $args.taskId',
      args: { taskId },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTaskBody}
          onChangeText={setNewTaskBody}
          placeholder="Add a task"
        />
        <Button
          title="Add Task"
          onPress={() => {
            addTask();
          }}
        />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <CheckboxComponent
              isChecked={item.isCompleted}
              onChecked={() => toggleComplete(item._id)}
            />
            <Text style={styles.itemText}>{item.body}</Text>
            <TouchableOpacity onPress={() => deleteTask(item._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 10,
    paddingLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  deleteText: {
    color: 'red',
  },
  itemText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default MainPage;
