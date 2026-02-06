use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use web_sys::console;

static GLOBAL_KNOWLEDGE: Lazy<Mutex<Knowledge>> =
  Lazy::new(|| Mutex::new(Knowledge::new()));

#[derive(Clone, Debug)]
pub struct Knowledge {
  data: Option<Data>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Data {
  id: usize,
}

impl Default for Knowledge {
  fn default() -> Self {
    Self::new()
  }
}

impl Knowledge {
  pub fn new() -> Self {
    Knowledge { data: None }
  }

  // pub fn change_item(&mut self) {
  //   self.data.as_mut().unwrap().current_index += 1;
  //   if self.data.as_ref().unwrap().current_index
  //     >= self.data.as_ref().unwrap().items.len()
  //   {
  //     self.data.as_mut().unwrap().current_index = 0
  //   }
  // }

  // pub fn current_index(&self) -> usize {
  //   self.data.as_ref().unwrap().current_index
  // }

  // pub fn current_item(&self) -> String {
  //   self.data.as_ref().unwrap().items[self.current_index()].clone()
  // }

  // pub fn dump_json(&self) -> String {
  //   serde_json::to_string_pretty(self.data.as_ref().unwrap())
  //     .unwrap()
  // }

  pub fn load_json(
    &mut self,
    content: String,
  ) {
    self.data = Some(serde_json::from_str(&content).unwrap())
  }
}

#[wasm_bindgen]
pub struct Deck;

#[wasm_bindgen]
impl Deck {
  //

  // pub fn change_item() -> Result<(), JsValue> {
  //   GLOBAL_KNOWLEDGE
  //     .lock()
  //     .map_err(|_| JsValue::from_str("could not get data lock"))?
  //     .change_item();
  //   Ok(())
  // }

  // pub fn current_index() -> Result<usize, JsValue> {
  //   Ok(
  //     GLOBAL_KNOWLEDGE
  //       .lock()
  //       .map_err(|_| JsValue::from_str("could not get data lock"))?
  //       .current_index(),
  //   )
  // }

  // pub fn current_item() -> Result<String, JsValue> {
  //   Ok(
  //     GLOBAL_KNOWLEDGE
  //       .lock()
  //       .map_err(|_| JsValue::from_str("could not get data lock"))?
  //       .current_item(),
  //   )
  // }

  // pub fn dump_json() -> Result<String, JsValue> {
  //   Ok(
  //     GLOBAL_KNOWLEDGE
  //       .lock()
  //       .map_err(|_| JsValue::from_str("could not get data lock"))?
  //       .dump_json(),
  //   )
  // }

  pub fn load_json(content: String) -> Result<(), JsValue> {
    console::log_1(&"Loading JSON".into());
    // console::log_1(&content.clone().into());
    GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?
      .load_json(content);
    Ok(())
  }

  //
}
