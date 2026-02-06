use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Mutex};
use wasm_bindgen::prelude::*;
use web_sys::console;

static GLOBAL_KNOWLEDGE: Lazy<Mutex<Knowledge>> =
  Lazy::new(|| Mutex::new(Knowledge::new()));

#[derive(Clone, Debug)]
pub struct Knowledge {
  active_filter: usize,
  active_card: Option<String>,
  data: Option<Data>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Data {
  id: usize,
  name: String,
  cards: Vec<Card>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Card {
  card: CardCard,
  categories: Vec<String>,
  id: usize,
  #[serde(default = "filter_default")]
  filter: usize,
  quantity: usize,
}

fn filter_default() -> usize {
  2
}

#[allow(non_snake_case)]
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CardCard {
  id: usize,
  uid: String,
  oracleCard: OracleCard,
  scryfallImageHash: String,
  rarity: String,
  globalCategories: Vec<String>,
}

#[allow(non_snake_case)]
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OracleCard {
  id: usize,
  cmc: usize,
  colorIdentity: Vec<String>,
  colors: Vec<String>,
  layout: String,
  uid: String,
  legalities: HashMap<String, Option<String>>,
  manaCost: String,
  manaProduction: HashMap<String, Option<usize>>,
  name: String,
  power: String,
  subTypes: Vec<String>,
  superTypes: Vec<String>,
  keywords: Vec<String>,
  text: String,
  toughness: String,
  types: Vec<String>,
  defaultCategory: Option<String>,
  gameChanger: bool,
  extraTurns: bool,
  tutor: bool,
  massLandDenial: bool,
  twoCardComboSingelton: bool,
  twoCardComboIds: Vec<String>,
  atomicCombos: Vec<String>,
  potentialCombos: Vec<String>,
}

impl Default for Knowledge {
  fn default() -> Self {
    Self::new()
  }
}

impl Knowledge {
  pub fn new() -> Self {
    Knowledge {
      active_card: None,
      active_filter: 2,
      data: None,
    }
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

  pub fn categories() -> Result<Vec<String>, JsValue> {
    Ok(vec![])
  }

  pub fn load_json(content: String) -> Result<(), JsValue> {
    console::log_1(&"Loading JSON".into());
    // console::log_1(&content.clone().into());
    GLOBAL_KNOWLEDGE
      .lock()
      .map_err(|_| JsValue::from_str("could not get data lock"))?
      .load_json(content);
    Ok(())
  }

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

  //
}
