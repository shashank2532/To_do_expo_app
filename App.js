import React, { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Constants from "expo-constants";
import { db } from "./components/database";
import Items from "./components/items";

export default function App() {
  const [text, setText] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);

  const addTask = () => {
    add(text);
    setText(null);
  };

  const add = (text) => {
    if (text === null || text === "") {
      return false;
    }

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>To Do App</Text>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite is not supported on web!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.flexRow}>
            <TextInput
              onChangeText={(text) => setText(text)}
              onSubmitEditing={addTask}
              placeholder="Write your task here."
              style={styles.input}
              value={text}
            />
            <TouchableOpacity onPress={addTask} style={styles.addButton}>
              <Text style={{ color: "#fff" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.listArea}>
            <Items
              key={`forceupdate-todo-${forceUpdateId}`}
              done={false}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`update items set done = 1 where id = ?;`, [
                      id,
                    ]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
            <Items
              done
              key={`forceupdate-done-${forceUpdateId}`}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`delete from items where id = ?;`, [id]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#a2d9ce",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    fontStyle: "italic",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderColor: "#0b5345",
    borderRadius: 25,
    borderWidth: 2,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  addButton: {
    backgroundColor: "#0b5345",
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical:2 ,
    marginLeft: 8,
  },
  listArea: {
    backgroundColor: "#d0ece7",
    flex: 1,
    paddingTop: 16,
  },
});
