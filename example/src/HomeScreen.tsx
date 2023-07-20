import React from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { useLiveQuery, useMutations } from 'react-native-starfish';

interface Task {
  _id: string;
  body: string;
  isCompleted: boolean;
}

export function HomeScreen() {
  const [newTaskBody, setNewTaskBody] = React.useState('');

  const { documents } = useLiveQuery({
    collection: 'tasks',
  });
  const { upsert, remove } = useMutations();

  const tasks = documents as Task[];

  return (
    <SafeAreaView style={styles.container}>
      {/** Begin Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.textInput}
          value={newTaskBody}
          onChangeText={setNewTaskBody}
        />
        <Pressable
          onPress={() => {
            upsert('tasks', {
              body: newTaskBody,
              isCompleted: false,
            });
            setNewTaskBody('');
          }}
        >
          <Text style={styles.addButton}>Add</Text>
        </Pressable>
      </View>
      {/** End Form */}

      {/** Begin Tasks List */}
      <FlatList
        style={styles.flatList}
        data={tasks}
        renderItem={({ item }) => {
          return (
            <View style={styles.taskContainer}>
              <Pressable
                style={styles.checkBox}
                onPress={() => {
                  upsert('tasks', {
                    _id: item._id,
                    isCompleted: !item.isCompleted,
                  });
                }}
              >
                {item.isCompleted ? (
                  <View style={styles.filledCheckBox} />
                ) : (
                  <View style={styles.unfilledCheckBox} />
                )}
              </Pressable>
              <Text style={styles.taskBodyText}>{item.body}</Text>
              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  remove({
                    collection: 'tasks',
                    find: '_id == $args._id',
                    args: {
                      _id: item._id,
                    },
                  });
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          );
        }}
      />
      {/** End Tasks List */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 16,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: 'gray',
    borderWidth: 1,
  },
  addButton: {
    minWidth: 60,
    textAlign: 'center',
    marginLeft: 16,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  flatList: {
    paddingHorizontal: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    verticalAlign: 'center',
  },
  taskBodyText: {
    fontSize: 17,
    alignSelf: 'center',
    flex: 1,
  },
  checkBox: {
    width: 30,
    height: 30,
    marginRight: 16,
  },
  filledCheckBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  unfilledCheckBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'gray',
  },
  deleteButton: {
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
